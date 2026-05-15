import React, { useState } from 'react';
import { Search, ExternalLink, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_COMPANIES = [
  {
    "id": 1,
    "name": "Google",
    "logo": "https://logo.clearbit.com/google.com",
    "website": "https://careers.google.com",
    "desc": "Explore career opportunities at Google.",
    "industry": "Big Tech"
  },
  {
    "id": 2,
    "name": "Microsoft",
    "logo": "https://logo.clearbit.com/microsoft.com",
    "website": "https://careers.microsoft.com",
    "desc": "Explore career opportunities at Microsoft.",
    "industry": "Big Tech"
  },
  {
    "id": 3,
    "name": "Amazon",
    "logo": "https://logo.clearbit.com/amazon.jobs",
    "website": "https://www.amazon.jobs",
    "desc": "Explore career opportunities at Amazon.",
    "industry": "Big Tech"
  },
  {
    "id": 4,
    "name": "Apple",
    "logo": "https://logo.clearbit.com/apple.com",
    "website": "https://jobs.apple.com",
    "desc": "Explore career opportunities at Apple.",
    "industry": "Big Tech"
  },
  {
    "id": 5,
    "name": "Meta",
    "logo": "https://logo.clearbit.com/metacom",
    "website": "https://www.metacareers.com",
    "desc": "Explore career opportunities at Meta.",
    "industry": "Big Tech"
  },
  {
    "id": 6,
    "name": "Netflix",
    "logo": "https://logo.clearbit.com/netflix.com",
    "website": "https://jobs.netflix.com",
    "desc": "Explore career opportunities at Netflix.",
    "industry": "Big Tech"
  },
  {
    "id": 7,
    "name": "Tesla",
    "logo": "https://logo.clearbit.com/tesla.com",
    "website": "https://www.tesla.com/careers",
    "desc": "Explore career opportunities at Tesla.",
    "industry": "Big Tech"
  },
  {
    "id": 8,
    "name": "NVIDIA",
    "logo": "https://logo.clearbit.com/nvidia.com",
    "website": "https://www.nvidia.com/en-us/about-nvidia/careers",
    "desc": "Explore career opportunities at NVIDIA.",
    "industry": "Big Tech"
  },
  {
    "id": 9,
    "name": "Adobe",
    "logo": "https://logo.clearbit.com/adobe.com",
    "website": "https://careers.adobe.com",
    "desc": "Explore career opportunities at Adobe.",
    "industry": "Big Tech"
  },
  {
    "id": 10,
    "name": "Intel",
    "logo": "https://logo.clearbit.com/intel.com",
    "website": "https://jobs.intel.com",
    "desc": "Explore career opportunities at Intel.",
    "industry": "Big Tech"
  },
  {
    "id": 11,
    "name": "Oracle",
    "logo": "https://logo.clearbit.com/oracle.com",
    "website": "https://www.oracle.com/careers",
    "desc": "Explore career opportunities at Oracle.",
    "industry": "IT & Software"
  },
  {
    "id": 12,
    "name": "IBM",
    "logo": "https://logo.clearbit.com/ibm.com",
    "website": "https://www.ibm.com/careers",
    "desc": "Explore career opportunities at IBM.",
    "industry": "IT & Software"
  },
  {
    "id": 13,
    "name": "SAP",
    "logo": "https://logo.clearbit.com/sap.com",
    "website": "https://jobs.sap.com",
    "desc": "Explore career opportunities at SAP.",
    "industry": "IT & Software"
  },
  {
    "id": 14,
    "name": "Salesforce",
    "logo": "https://logo.clearbit.com/salesforce.com",
    "website": "https://careers.salesforce.com",
    "desc": "Explore career opportunities at Salesforce.",
    "industry": "IT & Software"
  },
  {
    "id": 15,
    "name": "Cisco",
    "logo": "https://logo.clearbit.com/cisco.com",
    "website": "https://jobs.cisco.com",
    "desc": "Explore career opportunities at Cisco.",
    "industry": "IT & Software"
  },
  {
    "id": 16,
    "name": "Accenture",
    "logo": "https://logo.clearbit.com/accenture.com",
    "website": "https://www.accenture.com/careers",
    "desc": "Explore career opportunities at Accenture.",
    "industry": "IT & Software"
  },
  {
    "id": 17,
    "name": "Capgemini",
    "logo": "https://logo.clearbit.com/capgemini.com",
    "website": "https://www.capgemini.com/careers",
    "desc": "Explore career opportunities at Capgemini.",
    "industry": "IT & Software"
  },
  {
    "id": 18,
    "name": "Cognizant",
    "logo": "https://logo.clearbit.com/cognizant.com",
    "website": "https://careers.cognizant.com",
    "desc": "Explore career opportunities at Cognizant.",
    "industry": "IT & Software"
  },
  {
    "id": 19,
    "name": "HCLTech",
    "logo": "https://logo.clearbit.com/hcltech.com",
    "website": "https://www.hcltech.com/careers",
    "desc": "Explore career opportunities at HCLTech.",
    "industry": "IT & Software"
  },
  {
    "id": 20,
    "name": "Infosys",
    "logo": "https://logo.clearbit.com/infosys.com",
    "website": "https://www.infosys.com/careers",
    "desc": "Explore career opportunities at Infosys.",
    "industry": "IT & Software"
  },
  {
    "id": 21,
    "name": "TCS",
    "logo": "https://logo.clearbit.com/tcs.com",
    "website": "https://www.tcs.com/careers",
    "desc": "Explore career opportunities at TCS.",
    "industry": "Indian IT"
  },
  {
    "id": 22,
    "name": "Wipro",
    "logo": "https://logo.clearbit.com/wipro.com",
    "website": "https://careers.wipro.com",
    "desc": "Explore career opportunities at Wipro.",
    "industry": "Indian IT"
  },
  {
    "id": 23,
    "name": "Tech Mahindra",
    "logo": "https://logo.clearbit.com/techmahindra.com",
    "website": "https://careers.techmahindra.com",
    "desc": "Explore career opportunities at Tech Mahindra.",
    "industry": "Indian IT"
  },
  {
    "id": 24,
    "name": "L&T Technology Services",
    "logo": "https://logo.clearbit.com/ltts.com",
    "website": "https://careers.ltts.com",
    "desc": "Explore career opportunities at L&T Technology Services.",
    "industry": "Indian IT"
  },
  {
    "id": 25,
    "name": "Mindtree",
    "logo": "https://logo.clearbit.com/ltimindtree.com",
    "website": "https://www.ltimindtree.com/careers",
    "desc": "Explore career opportunities at Mindtree.",
    "industry": "Indian IT"
  },
  {
    "id": 26,
    "name": "Zoho",
    "logo": "https://logo.clearbit.com/zoho.com",
    "website": "https://www.zoho.com/careers",
    "desc": "Explore career opportunities at Zoho.",
    "industry": "Indian IT"
  },
  {
    "id": 27,
    "name": "Freshworks",
    "logo": "https://logo.clearbit.com/freshworks.com",
    "website": "https://www.freshworks.com/company/careers",
    "desc": "Explore career opportunities at Freshworks.",
    "industry": "Indian IT"
  },
  {
    "id": 28,
    "name": "Paytm",
    "logo": "https://logo.clearbit.com/paytm.com",
    "website": "https://paytm.com/careers",
    "desc": "Explore career opportunities at Paytm.",
    "industry": "Indian IT"
  },
  {
    "id": 29,
    "name": "PhonePe",
    "logo": "https://logo.clearbit.com/phonepe.com",
    "website": "https://www.phonepe.com/careers",
    "desc": "Explore career opportunities at PhonePe.",
    "industry": "Indian IT"
  },
  {
    "id": 30,
    "name": "Razorpay",
    "logo": "https://logo.clearbit.com/razorpay.com",
    "website": "https://razorpay.com/jobs",
    "desc": "Explore career opportunities at Razorpay.",
    "industry": "Indian IT"
  },
  {
    "id": 31,
    "name": "Uber",
    "logo": "https://logo.clearbit.com/uber.com",
    "website": "https://www.uber.com/careers",
    "desc": "Explore career opportunities at Uber.",
    "industry": "Startups"
  },
  {
    "id": 32,
    "name": "Airbnb",
    "logo": "https://logo.clearbit.com/airbnb.com",
    "website": "https://careers.airbnb.com",
    "desc": "Explore career opportunities at Airbnb.",
    "industry": "Startups"
  },
  {
    "id": 33,
    "name": "Spotify",
    "logo": "https://logo.clearbit.com/spotifycom",
    "website": "https://www.spotifyjobs.com",
    "desc": "Explore career opportunities at Spotify.",
    "industry": "Startups"
  },
  {
    "id": 34,
    "name": "Dropbox",
    "logo": "https://logo.clearbit.com/dropbox.com",
    "website": "https://jobs.dropbox.com",
    "desc": "Explore career opportunities at Dropbox.",
    "industry": "Startups"
  },
  {
    "id": 35,
    "name": "Stripe",
    "logo": "https://logo.clearbit.com/stripe.com",
    "website": "https://stripe.com/jobs",
    "desc": "Explore career opportunities at Stripe.",
    "industry": "Startups"
  },
  {
    "id": 36,
    "name": "Square",
    "logo": "https://logo.clearbit.com/squareup.com",
    "website": "https://careers.squareup.com",
    "desc": "Explore career opportunities at Square.",
    "industry": "Startups"
  },
  {
    "id": 37,
    "name": "Shopify",
    "logo": "https://logo.clearbit.com/shopify.com",
    "website": "https://www.shopify.com/careers",
    "desc": "Explore career opportunities at Shopify.",
    "industry": "Startups"
  },
  {
    "id": 38,
    "name": "Flipkart",
    "logo": "https://logo.clearbit.com/flipkartcom",
    "website": "https://www.flipkartcareers.com",
    "desc": "Explore career opportunities at Flipkart.",
    "industry": "Startups"
  },
  {
    "id": 39,
    "name": "Meesho",
    "logo": "https://logo.clearbit.com/meesho.io",
    "website": "https://www.meesho.io/jobs",
    "desc": "Explore career opportunities at Meesho.",
    "industry": "Startups"
  },
  {
    "id": 40,
    "name": "Swiggy",
    "logo": "https://logo.clearbit.com/swiggy.com",
    "website": "https://careers.swiggy.com",
    "desc": "Explore career opportunities at Swiggy.",
    "industry": "Startups"
  },
  {
    "id": 41,
    "name": "Goldman Sachs",
    "logo": "https://logo.clearbit.com/goldmansachs.com",
    "website": "https://www.goldmansachs.com/careers",
    "desc": "Explore career opportunities at Goldman Sachs.",
    "industry": "Finance"
  },
  {
    "id": 42,
    "name": "JPMorgan Chase",
    "logo": "https://logo.clearbit.com/jpmorgan.com",
    "website": "https://careers.jpmorgan.com",
    "desc": "Explore career opportunities at JPMorgan Chase.",
    "industry": "Finance"
  },
  {
    "id": 43,
    "name": "Morgan Stanley",
    "logo": "https://logo.clearbit.com/morganstanley.com",
    "website": "https://www.morganstanley.com/careers",
    "desc": "Explore career opportunities at Morgan Stanley.",
    "industry": "Finance"
  },
  {
    "id": 44,
    "name": "Deloitte",
    "logo": "https://logo.clearbit.com/www2.deloitte.com",
    "website": "https://www2.deloitte.com/careers",
    "desc": "Explore career opportunities at Deloitte.",
    "industry": "Finance"
  },
  {
    "id": 45,
    "name": "PwC",
    "logo": "https://logo.clearbit.com/pwc.com",
    "website": "https://www.pwc.com/careers",
    "desc": "Explore career opportunities at PwC.",
    "industry": "Finance"
  },
  {
    "id": 46,
    "name": "EY",
    "logo": "https://logo.clearbit.com/ey.com",
    "website": "https://careers.ey.com",
    "desc": "Explore career opportunities at EY.",
    "industry": "Finance"
  },
  {
    "id": 47,
    "name": "KPMG",
    "logo": "https://logo.clearbit.com/home.kpmg",
    "website": "https://home.kpmg/xx/en/home/careers.html",
    "desc": "Explore career opportunities at KPMG.",
    "industry": "Finance"
  },
  {
    "id": 48,
    "name": "HSBC",
    "logo": "https://logo.clearbit.com/hsbc.com",
    "website": "https://www.hsbc.com/careers",
    "desc": "Explore career opportunities at HSBC.",
    "industry": "Finance"
  },
  {
    "id": 49,
    "name": "American Express",
    "logo": "https://logo.clearbit.com/americanexpress.com",
    "website": "https://careers.americanexpress.com",
    "desc": "Explore career opportunities at American Express.",
    "industry": "Finance"
  },
  {
    "id": 50,
    "name": "Visa",
    "logo": "https://logo.clearbit.com/visa.com",
    "website": "https://jobs.visa.com",
    "desc": "Explore career opportunities at Visa.",
    "industry": "Finance"
  },
  {
    "id": 51,
    "name": "General Electric",
    "logo": "https://logo.clearbit.com/gecom",
    "website": "https://jobs.gecareers.com",
    "desc": "Explore career opportunities at General Electric.",
    "industry": "Engineering"
  },
  {
    "id": 52,
    "name": "Siemens",
    "logo": "https://logo.clearbit.com/siemens.com",
    "website": "https://jobs.siemens.com",
    "desc": "Explore career opportunities at Siemens.",
    "industry": "Engineering"
  },
  {
    "id": 53,
    "name": "Bosch",
    "logo": "https://logo.clearbit.com/bosch.com",
    "website": "https://www.bosch.com/careers",
    "desc": "Explore career opportunities at Bosch.",
    "industry": "Engineering"
  },
  {
    "id": 54,
    "name": "Toyota",
    "logo": "https://logo.clearbit.com/toyota.com",
    "website": "https://careers.toyota.com",
    "desc": "Explore career opportunities at Toyota.",
    "industry": "Engineering"
  },
  {
    "id": 55,
    "name": "Ford",
    "logo": "https://logo.clearbit.com/corporate.ford.com",
    "website": "https://corporate.ford.com/careers",
    "desc": "Explore career opportunities at Ford.",
    "industry": "Engineering"
  },
  {
    "id": 56,
    "name": "Hyundai",
    "logo": "https://logo.clearbit.com/hyundai.com",
    "website": "https://www.hyundai.com/worldwide/en/company/careers",
    "desc": "Explore career opportunities at Hyundai.",
    "industry": "Engineering"
  },
  {
    "id": 57,
    "name": "Tata Motors",
    "logo": "https://logo.clearbit.com/tatamotors.com",
    "website": "https://careers.tatamotors.com",
    "desc": "Explore career opportunities at Tata Motors.",
    "industry": "Engineering"
  },
  {
    "id": 58,
    "name": "Mahindra",
    "logo": "https://logo.clearbit.com/mahindra.com",
    "website": "https://www.mahindra.com/careers",
    "desc": "Explore career opportunities at Mahindra.",
    "industry": "Engineering"
  },
  {
    "id": 59,
    "name": "Boeing",
    "logo": "https://logo.clearbit.com/boeing.com",
    "website": "https://jobs.boeing.com",
    "desc": "Explore career opportunities at Boeing.",
    "industry": "Engineering"
  },
  {
    "id": 60,
    "name": "Airbus",
    "logo": "https://logo.clearbit.com/airbus.com",
    "website": "https://www.airbus.com/en/careers",
    "desc": "Explore career opportunities at Airbus.",
    "industry": "Engineering"
  },
  {
    "id": 61,
    "name": "Pfizer",
    "logo": "https://logo.clearbit.com/pfizer.com",
    "website": "https://www.pfizer.com/careers",
    "desc": "Explore career opportunities at Pfizer.",
    "industry": "Healthcare"
  },
  {
    "id": 62,
    "name": "Johnson & Johnson",
    "logo": "https://logo.clearbit.com/jnj.com",
    "website": "https://careers.jnj.com",
    "desc": "Explore career opportunities at Johnson & Johnson.",
    "industry": "Healthcare"
  },
  {
    "id": 63,
    "name": "Novartis",
    "logo": "https://logo.clearbit.com/novartis.com",
    "website": "https://www.novartis.com/careers",
    "desc": "Explore career opportunities at Novartis.",
    "industry": "Healthcare"
  },
  {
    "id": 64,
    "name": "Roche",
    "logo": "https://logo.clearbit.com/roche.com",
    "website": "https://careers.roche.com",
    "desc": "Explore career opportunities at Roche.",
    "industry": "Healthcare"
  },
  {
    "id": 65,
    "name": "Cipla",
    "logo": "https://logo.clearbit.com/cipla.com",
    "website": "https://www.cipla.com/careers",
    "desc": "Explore career opportunities at Cipla.",
    "industry": "Healthcare"
  },
  {
    "id": 66,
    "name": "Sun Pharma",
    "logo": "https://logo.clearbit.com/sunpharma.com",
    "website": "https://www.sunpharma.com/careers",
    "desc": "Explore career opportunities at Sun Pharma.",
    "industry": "Healthcare"
  },
  {
    "id": 67,
    "name": "Dr Reddy's",
    "logo": "https://logo.clearbit.com/drreddys.com",
    "website": "https://careers.drreddys.com",
    "desc": "Explore career opportunities at Dr Reddy's.",
    "industry": "Healthcare"
  },
  {
    "id": 68,
    "name": "Apollo Hospitals",
    "logo": "https://logo.clearbit.com/apollohospitals.com",
    "website": "https://careers.apollohospitals.com",
    "desc": "Explore career opportunities at Apollo Hospitals.",
    "industry": "Healthcare"
  },
  {
    "id": 69,
    "name": "Fortis Healthcare",
    "logo": "https://logo.clearbit.com/fortishealthcare.com",
    "website": "https://www.fortishealthcare.com/careers",
    "desc": "Explore career opportunities at Fortis Healthcare.",
    "industry": "Healthcare"
  },
  {
    "id": 70,
    "name": "Medtronic",
    "logo": "https://logo.clearbit.com/medtronic.com",
    "website": "https://www.medtronic.com/careers",
    "desc": "Explore career opportunities at Medtronic.",
    "industry": "Healthcare"
  },
  {
    "id": 71,
    "name": "Walmart",
    "logo": "https://logo.clearbit.com/walmart.com",
    "website": "https://careers.walmart.com",
    "desc": "Explore career opportunities at Walmart.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 72,
    "name": "Reliance Industries",
    "logo": "https://logo.clearbit.com/ril.com",
    "website": "https://careers.ril.com",
    "desc": "Explore career opportunities at Reliance Industries.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 73,
    "name": "ITC",
    "logo": "https://logo.clearbit.com/itcportal.com",
    "website": "https://www.itcportal.com/careers",
    "desc": "Explore career opportunities at ITC.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 74,
    "name": "Hindustan Unilever",
    "logo": "https://logo.clearbit.com/unilever.com",
    "website": "https://careers.unilever.com",
    "desc": "Explore career opportunities at Hindustan Unilever.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 75,
    "name": "Nestle",
    "logo": "https://logo.clearbit.com/nestle.com",
    "website": "https://www.nestle.com/jobs",
    "desc": "Explore career opportunities at Nestle.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 76,
    "name": "Procter & Gamble",
    "logo": "https://logo.clearbit.com/pgcom",
    "website": "https://www.pgcareers.com",
    "desc": "Explore career opportunities at Procter & Gamble.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 77,
    "name": "PepsiCo",
    "logo": "https://logo.clearbit.com/pepsicocom",
    "website": "https://www.pepsicojobs.com",
    "desc": "Explore career opportunities at PepsiCo.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 78,
    "name": "Coca Cola",
    "logo": "https://logo.clearbit.com/coca-colacompany.com",
    "website": "https://careers.coca-colacompany.com",
    "desc": "Explore career opportunities at Coca Cola.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 79,
    "name": "IKEA",
    "logo": "https://logo.clearbit.com/ikea.com",
    "website": "https://jobs.ikea.com",
    "desc": "Explore career opportunities at IKEA.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 80,
    "name": "Aditya Birla Group",
    "logo": "https://logo.clearbit.com/adityabirla.com",
    "website": "https://careers.adityabirla.com",
    "desc": "Explore career opportunities at Aditya Birla Group.",
    "industry": "Retail/FMCG"
  },
  {
    "id": 81,
    "name": "Dell",
    "logo": "https://logo.clearbit.com/dell.com",
    "website": "https://jobs.dell.com",
    "desc": "Explore career opportunities at Dell.",
    "industry": "Technology"
  },
  {
    "id": 82,
    "name": "HP",
    "logo": "https://logo.clearbit.com/hp.com",
    "website": "https://jobs.hp.com",
    "desc": "Explore career opportunities at HP.",
    "industry": "Technology"
  },
  {
    "id": 83,
    "name": "Lenovo",
    "logo": "https://logo.clearbit.com/lenovo.com",
    "website": "https://jobs.lenovo.com",
    "desc": "Explore career opportunities at Lenovo.",
    "industry": "Technology"
  },
  {
    "id": 84,
    "name": "Qualcomm",
    "logo": "https://logo.clearbit.com/qualcomm.com",
    "website": "https://careers.qualcomm.com",
    "desc": "Explore career opportunities at Qualcomm.",
    "industry": "Technology"
  },
  {
    "id": 85,
    "name": "AMD",
    "logo": "https://logo.clearbit.com/amd.com",
    "website": "https://careers.amd.com",
    "desc": "Explore career opportunities at AMD.",
    "industry": "Technology"
  },
  {
    "id": 86,
    "name": "Uber Eats",
    "logo": "https://logo.clearbit.com/uber.com",
    "website": "https://www.uber.com/careers",
    "desc": "Explore career opportunities at Uber Eats.",
    "industry": "Technology"
  },
  {
    "id": 87,
    "name": "Zomato",
    "logo": "https://logo.clearbit.com/zomato.com",
    "website": "https://www.zomato.com/careers",
    "desc": "Explore career opportunities at Zomato.",
    "industry": "Technology"
  },
  {
    "id": 88,
    "name": "Byju's",
    "logo": "https://logo.clearbit.com/byjus.com",
    "website": "https://byjus.com/careers",
    "desc": "Explore career opportunities at Byju's.",
    "industry": "Technology"
  },
  {
    "id": 89,
    "name": "Unacademy",
    "logo": "https://logo.clearbit.com/unacademy.com",
    "website": "https://unacademy.com/careers",
    "desc": "Explore career opportunities at Unacademy.",
    "industry": "Technology"
  },
  {
    "id": 90,
    "name": "Coursera",
    "logo": "https://logo.clearbit.com/coursera.com",
    "website": "https://careers.coursera.com",
    "desc": "Explore career opportunities at Coursera.",
    "industry": "Technology"
  },
  {
    "id": 91,
    "name": "Udemy",
    "logo": "https://logo.clearbit.com/udemy.com",
    "website": "https://careers.udemy.com",
    "desc": "Explore career opportunities at Udemy.",
    "industry": "Technology"
  },
  {
    "id": 92,
    "name": "Twitter",
    "logo": "https://logo.clearbit.com/x.com",
    "website": "https://careers.x.com",
    "desc": "Explore career opportunities at Twitter.",
    "industry": "Technology"
  },
  {
    "id": 93,
    "name": "Snapchat",
    "logo": "https://logo.clearbit.com/snap.com",
    "website": "https://careers.snap.com",
    "desc": "Explore career opportunities at Snapchat.",
    "industry": "Technology"
  },
  {
    "id": 94,
    "name": "Pinterest",
    "logo": "https://logo.clearbit.com/pinterest.com",
    "website": "https://careers.pinterest.com",
    "desc": "Explore career opportunities at Pinterest.",
    "industry": "Technology"
  },
  {
    "id": 95,
    "name": "Reddit",
    "logo": "https://logo.clearbit.com/redditinc.com",
    "website": "https://www.redditinc.com/careers",
    "desc": "Explore career opportunities at Reddit.",
    "industry": "Technology"
  },
  {
    "id": 96,
    "name": "Zoom",
    "logo": "https://logo.clearbit.com/zoom.us",
    "website": "https://careers.zoom.us",
    "desc": "Explore career opportunities at Zoom.",
    "industry": "Technology"
  },
  {
    "id": 97,
    "name": "Slack",
    "logo": "https://logo.clearbit.com/slack.com",
    "website": "https://slack.com/careers",
    "desc": "Explore career opportunities at Slack.",
    "industry": "Technology"
  },
  {
    "id": 98,
    "name": "Atlassian",
    "logo": "https://logo.clearbit.com/atlassian.com",
    "website": "https://www.atlassian.com/company/careers",
    "desc": "Explore career opportunities at Atlassian.",
    "industry": "Technology"
  },
  {
    "id": 99,
    "name": "GitHub",
    "logo": "https://logo.clearbit.com/github.careers",
    "website": "https://github.careers",
    "desc": "Explore career opportunities at GitHub.",
    "industry": "Technology"
  },
  {
    "id": 100,
    "name": "Cloudflare",
    "logo": "https://logo.clearbit.com/cloudflare.com",
    "website": "https://www.cloudflare.com/careers",
    "desc": "Explore career opportunities at Cloudflare.",
    "industry": "Technology"
  }
];

const Companies = () => {
  const [search, setSearch] = useState('');
  
  const filtered = MOCK_COMPANIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-darkGreen">Top Companies Showcase</h1>
          <p className="text-gray-600 mt-2">Discover and apply to top-tier organizations.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search companies or industries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-full py-3 pl-12 pr-4 border border-gray-200 focus:border-darkGreen focus:ring-2 focus:ring-darkGreen/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((company, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={company.id} 
            className="glassmorphism p-6 hover:shadow-2xl transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={`https://s2.googleusercontent.com/s2/favicons?domain=${company.logo.replace('https://logo.clearbit.com/', '')}&sz=128`} 
                alt={company.name} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                className="w-16 h-16 rounded-xl object-contain bg-white p-2 border border-gray-100 shadow-sm shrink-0" 
              />
              <div style={{display: 'none'}} className="w-16 h-16 rounded-xl bg-darkGreen text-white items-center justify-center text-2xl font-black border border-gray-100 shadow-sm shrink-0">
                {company.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{company.industry}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-6 min-h-[48px]">{company.desc}</p>
            <div className="flex gap-3">
              <a href={company.website} target="_blank" rel="noreferrer" className="w-full bg-darkGreen text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                Careers <ExternalLink size={16}/>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Companies;
