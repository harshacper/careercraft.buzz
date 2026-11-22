const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const aiProvider = require('../services/aiProvider');
const { CURRICULUM, VERIFIED_QUESTION_BANK } = require('../knowledge/curriculumData');

// 1. GET /api/assessment/curriculum
// Returns the full list of 12 courses, modules, and topics
router.get('/curriculum', (req, res) => {
  try {
    res.json({
      success: true,
      courses: CURRICULUM
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/assessment/generate-questions
// Agent 1: Question Generator
router.post('/generate-questions', async (req, res) => {
  try {
    const {
      courseName = 'Software Engineering',
      moduleName = '',
      topicName = '',
      questionCount = 5,
      difficulty = 'Medium', // Easy | Medium | Hard | Mixed
      questionType = 'Mixed', // MCQ | Short Answer | Long Answer | Coding Questions | True/False | Fill in the Blanks | Mixed
      timeLimitMinutes = 20,
      marksPerQuestion = 5,
      isRandomized = false
    } = req.body;

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 3), 30);
    const targetMarks = parseInt(marksPerQuestion, 10) || 5;

    // Build prompt for Question Generator Agent
    const prompt = `You are an elite University Computer Science Professor and Examination Generator (Agent 1: Question Generator).
Course: "${courseName}"
${moduleName ? `Module: "${moduleName}"` : 'Syllabus: Comprehensive across core modules'}
${topicName ? `Topic: "${topicName}"` : 'Topic: Mixed syllabus topics'}
Target Question Count: ${count}
Difficulty Level: "${difficulty}" (Easy, Medium, Hard, or Mixed)
Question Type: "${questionType}"
Marks per question: ${targetMarks}
Randomized mode: ${isRandomized ? 'Yes - span multiple topics across the course' : 'No - tightly focus on the selected topic'}

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY ${count} high-quality, technically rigorous academic questions.
2. If questionType is 'MCQ', provide 4 realistic options in the 'options' array.
3. If questionType is 'True/False', provide options ['True', 'False'].
4. If questionType is 'Coding Questions', provide a clean starter code in 'codeTemplate'.
5. If questionType is 'Fill in the Blanks', make the blank clearly indicated as '_______'.
6. If questionType is 'Mixed', provide a balanced blend of MCQs, Short Answers, True/False, and Coding/Problem questions.
7. Avoid duplicate questions.
8. RETURN ONLY A VALID JSON ARRAY OF OBJECTS matching this schema:
[
  {
    "id": "q1",
    "question": "Full question text...",
    "type": "MCQ", // or "Short Answer", "Long Answer", "True/False", "Fill in the Blanks", "Coding Questions"
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only for MCQ / True/False
    "correctAnswer": "Exact correct answer or model solution",
    "marks": ${targetMarks},
    "difficulty": "${difficulty === 'Mixed' ? 'Medium' : difficulty}",
    "topic": "${topicName || 'Core Concept'}",
    "codeTemplate": "// optional code starter",
    "rubric": "Marking criteria explanation"
  }
]`;

    let generatedQuestions = [];

    try {
      const aiResponse = await aiProvider.processChat({
        message: prompt,
        context: 'AI Academic Examination Question Generator Agent JSON Mode'
      });

      const reply = aiResponse?.reply || '';
      const jsonStart = reply.indexOf('[');
      const jsonEnd = reply.lastIndexOf(']');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(reply.slice(jsonStart, jsonEnd + 1));
        if (Array.isArray(parsed) && parsed.length > 0) {
          generatedQuestions = parsed.map((q, idx) => ({
            id: `q-${idx + 1}-${Date.now().toString(36)}`,
            question: q.question || `Question ${idx + 1}`,
            type: q.type || 'MCQ',
            options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: q.correctAnswer || 'Correct Answer',
            marks: q.marks || targetMarks,
            difficulty: q.difficulty || difficulty,
            topic: q.topic || topicName || courseName,
            codeTemplate: q.codeTemplate || '',
            rubric: q.rubric || 'Full credit for accuracy.'
          }));
        }
      }
    } catch (llmErr) {
      console.warn('AI question generation fallback triggered:', llmErr.message);
    }

    // Fallback: If AI generation was unavailable or incomplete, assemble verified curriculum questions
    if (!generatedQuestions || generatedQuestions.length < count) {
      const matched = VERIFIED_QUESTION_BANK.filter(
        q => q.course.toLowerCase() === courseName.toLowerCase()
      );
      const pool = matched.length > 0 ? matched : VERIFIED_QUESTION_BANK;

      while (generatedQuestions.length < count) {
        const item = pool[generatedQuestions.length % pool.length];
        generatedQuestions.push({
          id: `q-${generatedQuestions.length + 1}-${Date.now().toString(36)}`,
          question: item.question,
          type: questionType !== 'Mixed' ? questionType : item.type,
          options: item.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: item.correctAnswer,
          marks: targetMarks,
          difficulty: difficulty !== 'Mixed' ? difficulty : item.difficulty,
          topic: topicName || item.topic,
          codeTemplate: item.codeTemplate || '',
          rubric: item.rubric
        });
      }
    }

    res.json({
      success: true,
      course: courseName,
      module: moduleName,
      topic: topicName,
      timeLimitMinutes: parseInt(timeLimitMinutes, 10) || 20,
      totalQuestions: generatedQuestions.length,
      totalMarks: generatedQuestions.reduce((acc, q) => acc + (q.marks || 5), 0),
      questions: generatedQuestions
    });
  } catch (err) {
    console.error('Error generating questions:', err);
    res.status(500).json({ error: 'Failed to generate examination questions', message: err.message });
  }
});

// 3. POST /api/assessment/evaluate
// Agents 2, 3, 4, 5: Answer Evaluator, Explanation Agent, Performance Analyst & Personal Learning Assistant
router.post('/evaluate', async (req, res) => {
  try {
    const {
      userId = null,
      userEmail = null,
      courseName = 'Software Engineering',
      subjectName = 'Software Engineering',
      moduleName = '',
      topicName = '',
      difficulty = 'Medium',
      questionType = 'Mixed',
      timeLimitMinutes = 20,
      timeTakenSeconds = 0,
      questions = [],
      studentAnswers = {}
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions list cannot be empty for evaluation' });
    }

    // Prepare questions summary for evaluation agent
    const examPayload = questions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      question: q.question,
      type: q.type,
      topic: q.topic || topicName,
      maxMarks: q.marks || 5,
      expectedAnswer: q.correctAnswer,
      studentAnswer: studentAnswers[q.id] || '(Unanswered)'
    }));

    const evalPrompt = `You are a multi-agent Academic Examination Evaluation System:
- Agent 2 (Answer Evaluator): Evaluate technical correctness, semantic meaning, keywords, and logic. NEVER award marks solely because keywords exist. Support partial marks.
- Agent 3 (Explanation Agent): Provide crystal-clear explanations of the correct answer, pinpoint mistakes, and explain how to improve.
- Agent 4 (Performance Analyst): Identify weak topics vs strong topics.
- Agent 5 (Personal Learning Assistant): Provide actionable study roadmap and recommended next learning steps.

Course: "${courseName}"
Topic: "${topicName || 'Mixed Topics'}"
Exam Questions and Student Submissions:
${JSON.stringify(examPayload, null, 2)}

EVALUATION RULES:
1. For MCQ / True-False: If student answer matches expected, award full marks; else 0.
2. For Short & Long Answers: Evaluate semantic meaning and technical accuracy. Award partial marks where appropriate.
3. For Coding Questions: Evaluate syntax, logic, edge-case handling, and algorithmic structure.
4. For Unanswered questions: Award 0 marks with explanation of the model answer.

RETURN ONLY VALID JSON matching this exact structure:
{
  "questionEvaluations": [
    {
      "id": "q1",
      "marksAwarded": 4.5,
      "maxMarks": 5,
      "status": "correct", // "correct", "partially_correct", "incorrect", "unanswered"
      "isCorrect": true,
      "explanation": "Clear explanation of why this answer is right/wrong and the core concept.",
      "missingOrIncorrect": "Specific points that were missed or misunderstood.",
      "howToImprove": "Actionable advice on how the student can improve this answer next time."
    }
  ],
  "overallAnalysis": {
    "strongTopics": ["Topic 1", "Topic 2"],
    "weakTopics": ["Topic 3"],
    "recommendedRevisionTopics": ["Topic 3 - Key principles"],
    "studyRecommendations": [
      "Review the concepts of ...",
      "Practice more implementation exercises on ..."
    ],
    "suggestedNextLevel": "Advanced Level or Next Module"
  }
}`;

    let evaluatedQuestions = [];
    let overallAnalysis = {
      strongTopics: [topicName || courseName],
      weakTopics: [],
      recommendedRevisionTopics: ['Core definitions & practical implementation'],
      studyRecommendations: [
        'Review the key concepts and architecture patterns highlighted in incorrect answers.',
        'Practice solving coding exercises and write end-to-end tests.'
      ],
      suggestedNextLevel: 'Level Up to Next Module'
    };

    try {
      const evalRes = await aiProvider.processChat({
        message: evalPrompt,
        context: 'AI Academic Answer Evaluation Agent JSON Mode'
      });

      const reply = evalRes?.reply || '';
      const jsonStart = reply.indexOf('{');
      const jsonEnd = reply.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(reply.slice(jsonStart, jsonEnd + 1));
        if (Array.isArray(parsed.questionEvaluations)) {
          evaluatedQuestions = parsed.questionEvaluations;
        }
        if (parsed.overallAnalysis) {
          overallAnalysis = { ...overallAnalysis, ...parsed.overallAnalysis };
        }
      }
    } catch (aiErr) {
      console.warn('AI answer evaluation fallback engaged:', aiErr.message);
    }

    // Deterministic fallback evaluation to ensure 100% calculation reliability
    const detailedResults = questions.map((q, idx) => {
      const studentAns = (studentAnswers[q.id] || '').trim();
      const existingEval = evaluatedQuestions.find(e => e.id === q.id || e.id === `q${idx + 1}`);
      const maxMarks = q.marks || 5;

      if (existingEval && typeof existingEval.marksAwarded === 'number') {
        return {
          ...q,
          studentAnswer: studentAns || '(No Answer Provided)',
          marksAwarded: Math.min(Math.max(existingEval.marksAwarded, 0), maxMarks),
          status: existingEval.status || (existingEval.marksAwarded >= maxMarks * 0.8 ? 'correct' : existingEval.marksAwarded > 0 ? 'partially_correct' : 'incorrect'),
          explanation: existingEval.explanation || q.explanation || 'See model solution.',
          missingOrIncorrect: existingEval.missingOrIncorrect || (studentAns ? 'Key details were missing.' : 'Question was left unanswered.'),
          howToImprove: existingEval.howToImprove || 'Review this concept in the course syllabus.'
        };
      }

      // Default deterministic scoring
      if (!studentAns) {
        return {
          ...q,
          studentAnswer: '(No Answer Provided)',
          marksAwarded: 0,
          status: 'unanswered',
          explanation: q.explanation || `The expected answer is: ${q.correctAnswer}`,
          missingOrIncorrect: 'The question was left blank.',
          howToImprove: 'Attempt all questions. Review the topic basics.'
        };
      }

      const isExactMatch = studentAns.toLowerCase() === (q.correctAnswer || '').toLowerCase().trim();
      const marksAwarded = isExactMatch ? maxMarks : (studentAns.length > 20 ? Math.round(maxMarks * 0.6) : 0);

      return {
        ...q,
        studentAnswer: studentAns,
        marksAwarded,
        status: marksAwarded === maxMarks ? 'correct' : marksAwarded > 0 ? 'partially_correct' : 'incorrect',
        explanation: q.explanation || `Expected answer: ${q.correctAnswer}`,
        missingOrIncorrect: isExactMatch ? 'None. Answer satisfies expectations.' : 'Lacks technical depth or precise keywords.',
        howToImprove: 'Elaborate on core mechanisms and provide practical examples.'
      };
    });

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 5), 0);
    const marksObtained = detailedResults.reduce((sum, q) => sum + (q.marksAwarded || 0), 0);
    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100 * 10) / 10 : 0;

    // Determine performance level
    let performanceLevel = 'Requires More Practice';
    if (percentage >= 90) performanceLevel = 'Excellent';
    else if (percentage >= 75) performanceLevel = 'Very Good';
    else if (percentage >= 60) performanceLevel = 'Good';
    else if (percentage >= 40) performanceLevel = 'Needs Improvement';

    const counts = {
      correct: detailedResults.filter(q => q.status === 'correct').length,
      partiallyCorrect: detailedResults.filter(q => q.status === 'partially_correct').length,
      incorrect: detailedResults.filter(q => q.status === 'incorrect').length,
      unanswered: detailedResults.filter(q => q.status === 'unanswered').length
    };

    const accuracy = questions.length > 0
      ? Math.round(((counts.correct + counts.partiallyCorrect * 0.5) / questions.length) * 100)
      : 0;

    const evaluationResult = {
      courseName,
      subjectName,
      moduleName,
      topicName,
      difficulty,
      questionType,
      totalQuestions: questions.length,
      totalMarks,
      marksObtained,
      percentage,
      performanceLevel,
      counts,
      accuracy,
      timeLimitMinutes,
      timeTakenSeconds,
      detailedResults,
      recommendations: overallAnalysis
    };

    // Save to Supabase assessments table asynchronously
    try {
      await supabase.from('assessments').insert({
        user_id: userId || 'guest',
        user_email: userEmail || 'student@careercraft.buzz',
        course_name: courseName,
        subject_name: subjectName,
        module_name: moduleName,
        topic_name: topicName || 'Mixed',
        difficulty,
        question_type: questionType,
        total_questions: questions.length,
        time_limit_minutes: timeLimitMinutes,
        time_taken_seconds: timeTakenSeconds,
        total_marks: totalMarks,
        marks_obtained: marksObtained,
        percentage,
        performance_level: performanceLevel,
        questions,
        student_answers: studentAnswers,
        evaluation: evaluationResult,
        recommendations: overallAnalysis
      });
    } catch (dbErr) {
      console.warn('Could not persist assessment to Supabase:', dbErr.message);
    }

    res.json({
      success: true,
      data: evaluationResult
    });
  } catch (err) {
    console.error('Error evaluating assessment:', err);
    res.status(500).json({ error: 'Failed to evaluate assessment', message: err.message });
  }
});

// 4. GET /api/assessment/history
// Returns previous assessment history for student progress tracking
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;

    let query = supabase
      .from('assessments')
      .select('id, course_name, subject_name, module_name, topic_name, difficulty, total_marks, marks_obtained, percentage, performance_level, time_taken_seconds, created_at')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10) || 20);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    res.json({
      success: true,
      history: data || []
    });
  } catch (err) {
    console.warn('Error fetching assessment history from Supabase:', err.message);
    // Return empty list on connection fallback
    res.json({
      success: true,
      history: []
    });
  }
});

// 5. POST /api/assessment/doubt
// Agent: Personal AI Learning Chatbot / Tutor for answering question doubts
router.post('/doubt', async (req, res) => {
  try {
    const { question, studentAnswer, doubt, course, topic } = req.body;

    const doubtPrompt = `You are a supportive, friendly AI Academic Teacher and Tutor.
Course: "${course || 'Computer Science'}"
Topic: "${topic || 'General'}"
Original Question: "${question || ''}"
Student's Answer: "${studentAnswer || 'N/A'}"
Student's Doubt / Question: "${doubt}"

Provide a warm, encouraging, and pedagogically clear explanation with intuitive analogies or code snippets where applicable. Format nicely using markdown.`;

    const aiRes = await aiProvider.processChat({
      message: doubtPrompt,
      context: 'AI Academic Teacher Tutor'
    });

    res.json({
      success: true,
      reply: aiRes?.reply || 'Could not generate answer at this moment.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
