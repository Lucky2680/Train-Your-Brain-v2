/* Course content, study lines and typing words. Edit this file to add or change courses. */
const LINES={
 cs:{n:'Computer Science',e:'💻',c:['Python Basics','Data Structures','Machine Learning Intro','Web Development']},
 sci:{n:'Science',e:'🔬',c:['Physics Fundamentals','Chemistry Basics','Biology Essentials','Mathematics']},
 com:{n:'Commerce',e:'📊',c:['Accounting','Business Studies','Economics','Basic Finance']},
 art:{n:'Arts & Language',e:'🎨',c:['English Writing','History','Psychology Basics','Creative Thinking']}
};
/* t = title, x = lesson text, q = quiz question, o = options, a = index of the correct option */
const LESSONS={
 "Python Basics": [
  {
   "t": "Variables",
   "x": "A variable stores a value, like age = 18. Python works out the type for you.",
   "q": "Which line creates a variable?",
   "o": [
    "18 = age",
    "age = 18",
    "var age 18"
   ],
   "a": 1
  },
  {
   "t": "Lists",
   "x": "A list holds many items in order, like fruits = ['apple', 'mango']. Counting starts at 0.",
   "q": "What is fruits[0]?",
   "o": [
    "apple",
    "mango",
    "0"
   ],
   "a": 0
  },
  {
   "t": "Loops",
   "x": "A for loop repeats code for each item: for x in items: print(x).",
   "q": "Which keyword repeats code for each item?",
   "o": [
    "if",
    "def",
    "for"
   ],
   "a": 2
  }
 ],
 "Data Structures": [
  {
   "t": "Stack",
   "x": "A stack is Last In, First Out (LIFO), like a pile of plates.",
   "q": "Which item leaves a stack first?",
   "o": [
    "The first one added",
    "The last one added",
    "The biggest one"
   ],
   "a": 1
  },
  {
   "t": "Queue",
   "x": "A queue is First In, First Out (FIFO), like a line at a ticket counter.",
   "q": "Which structure is FIFO?",
   "o": [
    "Queue",
    "Stack",
    "Tree"
   ],
   "a": 0
  },
  {
   "t": "Hash table",
   "x": "A hash table stores key-value pairs and finds a value fast using its key.",
   "q": "A hash table finds values using a...?",
   "o": [
    "Sorting step",
    "Key",
    "Loop only"
   ],
   "a": 1
  }
 ],
 "Machine Learning Intro": [
  {
   "t": "What is ML",
   "x": "Machine learning lets computers learn patterns from data instead of following fixed rules.",
   "q": "ML learns mainly from...?",
   "o": [
    "Fixed rules only",
    "Luck",
    "Data"
   ],
   "a": 2
  },
  {
   "t": "Train and test",
   "x": "We train a model on one part of the data and test it on unseen data.",
   "q": "Why use test data?",
   "o": [
    "To check performance on unseen data",
    "To make training faster",
    "To delete errors"
   ],
   "a": 0
  },
  {
   "t": "Overfitting",
   "x": "Overfitting means the model memorises training data and does badly on new data.",
   "q": "An overfit model performs badly on...?",
   "o": [
    "Training data",
    "New data",
    "Both always"
   ],
   "a": 1
  }
 ],
 "Web Development": [
  {
   "t": "HTML",
   "x": "HTML gives a page its structure using tags like <h1> and <p>.",
   "q": "Which language structures a web page?",
   "o": [
    "CSS",
    "SQL",
    "HTML"
   ],
   "a": 2
  },
  {
   "t": "CSS",
   "x": "CSS controls colours, fonts and layout of a page.",
   "q": "Which language styles a page?",
   "o": [
    "CSS",
    "HTML",
    "Python"
   ],
   "a": 0
  },
  {
   "t": "JavaScript",
   "x": "JavaScript makes pages interactive, like reacting to a button click.",
   "q": "Which makes a page interactive?",
   "o": [
    "CSS",
    "JavaScript",
    "A heading tag"
   ],
   "a": 1
  }
 ],
 "Physics Fundamentals": [
  {
   "t": "Speed",
   "x": "Speed = distance / time. 100 km in 2 hours is 50 km/h.",
   "q": "Speed for 100 km in 2 hours?",
   "o": [
    "25 km/h",
    "50 km/h",
    "200 km/h"
   ],
   "a": 1
  },
  {
   "t": "Newton's first law",
   "x": "An object stays at rest or keeps moving straight unless a force acts on it.",
   "q": "What changes an object's motion?",
   "o": [
    "A force",
    "Its colour",
    "Its name"
   ],
   "a": 0
  },
  {
   "t": "Energy",
   "x": "Energy cannot be created or destroyed, only changed from one form to another.",
   "q": "A bulb changes electrical energy into...?",
   "o": [
    "Only sound",
    "Light and heat",
    "Mass"
   ],
   "a": 1
  }
 ],
 "Chemistry Basics": [
  {
   "t": "Atoms",
   "x": "Atoms are tiny building blocks of matter made of protons, neutrons and electrons.",
   "q": "Which particle is negative?",
   "o": [
    "Proton",
    "Neutron",
    "Electron"
   ],
   "a": 2
  },
  {
   "t": "Elements",
   "x": "An element contains only one type of atom, like oxygen or gold.",
   "q": "Which is an element?",
   "o": [
    "Water",
    "Gold",
    "Salt water"
   ],
   "a": 1
  },
  {
   "t": "Acids and bases",
   "x": "Acids have pH below 7, bases above 7, and pure water is neutral at 7.",
   "q": "pH of pure water?",
   "o": [
    "7",
    "1",
    "14"
   ],
   "a": 0
  }
 ],
 "Biology Essentials": [
  {
   "t": "The cell",
   "x": "The cell is the basic unit of life. The nucleus controls its activities.",
   "q": "Which part controls the cell?",
   "o": [
    "Cell wall only",
    "Nucleus",
    "Blood"
   ],
   "a": 1
  },
  {
   "t": "Photosynthesis",
   "x": "Plants use sunlight, water and carbon dioxide to make food and release oxygen.",
   "q": "Plants release which gas?",
   "o": [
    "Carbon dioxide",
    "Nitrogen",
    "Oxygen"
   ],
   "a": 2
  },
  {
   "t": "DNA",
   "x": "DNA carries genetic information passed from parents to children.",
   "q": "What carries genetic information?",
   "o": [
    "Glucose",
    "DNA",
    "Oxygen"
   ],
   "a": 1
  }
 ],
 "Mathematics": [
  {
   "t": "Fractions",
   "x": "A fraction shows part of a whole. 1/2 equals 0.5.",
   "q": "1/2 equals?",
   "o": [
    "0.2",
    "0.5",
    "2.0"
   ],
   "a": 1
  },
  {
   "t": "Percentages",
   "x": "Percent means 'out of 100'. 25% of 200 is 50.",
   "q": "20% of 100 is?",
   "o": [
    "20",
    "2",
    "80"
   ],
   "a": 0
  },
  {
   "t": "Algebra",
   "x": "In algebra, letters stand for unknown numbers. If x + 3 = 7 then x = 4.",
   "q": "If x + 2 = 5, x is?",
   "o": [
    "7",
    "2",
    "3"
   ],
   "a": 2
  }
 ],
 "Accounting": [
  {
   "t": "Assets",
   "x": "Assets are things a business owns that have value, like cash and equipment.",
   "q": "Which is an asset?",
   "o": [
    "Loan owed",
    "Cash",
    "Rent due"
   ],
   "a": 1
  },
  {
   "t": "Debit and credit",
   "x": "Every transaction has a debit and a credit entry, so the books balance.",
   "q": "Each transaction has...?",
   "o": [
    "Only a debit",
    "No entry",
    "A debit and a credit"
   ],
   "a": 2
  },
  {
   "t": "Balance sheet",
   "x": "A balance sheet shows assets, liabilities and equity at one point in time.",
   "q": "A balance sheet shows...?",
   "o": [
    "Assets, liabilities and equity",
    "Only profit",
    "Only sales"
   ],
   "a": 0
  }
 ],
 "Business Studies": [
  {
   "t": "Business types",
   "x": "A sole proprietorship has one owner. A company is a separate legal entity.",
   "q": "Owners in a sole proprietorship?",
   "o": [
    "Many",
    "One",
    "None"
   ],
   "a": 1
  },
  {
   "t": "Marketing mix",
   "x": "The 4 Ps are Product, Price, Place and Promotion.",
   "q": "Which is NOT one of the 4 Ps?",
   "o": [
    "Price",
    "Promotion",
    "Payroll"
   ],
   "a": 2
  },
  {
   "t": "Profit",
   "x": "Profit equals revenue minus costs.",
   "q": "Profit = ?",
   "o": [
    "Revenue + costs",
    "Costs - revenue",
    "Revenue - costs"
   ],
   "a": 2
  }
 ],
 "Economics": [
  {
   "t": "Demand",
   "x": "When the price of a good rises, people usually demand less of it.",
   "q": "Price rises, demand usually...?",
   "o": [
    "Falls",
    "Rises",
    "Doubles"
   ],
   "a": 0
  },
  {
   "t": "Supply",
   "x": "When prices rise, sellers are usually willing to supply more.",
   "q": "Higher price usually makes supply...?",
   "o": [
    "Fall",
    "Stay zero",
    "Rise"
   ],
   "a": 2
  },
  {
   "t": "Inflation",
   "x": "Inflation is a general rise in prices over time, so money buys less.",
   "q": "Inflation means prices generally...?",
   "o": [
    "Fall",
    "Rise",
    "Never change"
   ],
   "a": 1
  }
 ],
 "Basic Finance": [
  {
   "t": "Saving",
   "x": "Saving means keeping part of your income for the future. Start small and be regular.",
   "q": "Good saving habit?",
   "o": [
    "Save only once a year",
    "Never save",
    "Save a little regularly"
   ],
   "a": 2
  },
  {
   "t": "Simple interest",
   "x": "Simple interest = Principal x Rate x Time / 100. 1000 at 10% for 1 year gives 100.",
   "q": "Interest on 1000 at 10% for 1 year?",
   "o": [
    "10",
    "100",
    "1000"
   ],
   "a": 1
  },
  {
   "t": "Budget",
   "x": "A budget plans spending: needs first, then wants, then savings.",
   "q": "What comes first in a budget?",
   "o": [
    "Wants",
    "Luxuries",
    "Needs"
   ],
   "a": 2
  }
 ],
 "English Writing": [
  {
   "t": "Sentences",
   "x": "A complete sentence has a subject and a verb, like 'Riya reads.'",
   "q": "Which is a complete sentence?",
   "o": [
    "Running fast",
    "Riya reads.",
    "In the park"
   ],
   "a": 1
  },
  {
   "t": "Paragraphs",
   "x": "A paragraph has one main idea supported by a few related sentences.",
   "q": "A paragraph should have...?",
   "o": [
    "Many unrelated ideas",
    "No sentences",
    "One main idea"
   ],
   "a": 2
  },
  {
   "t": "Punctuation",
   "x": "A full stop ends a statement and a question mark ends a question.",
   "q": "Which ends a question?",
   "o": [
    "?",
    ".",
    ","
   ],
   "a": 0
  }
 ],
 "History": [
  {
   "t": "Primary sources",
   "x": "Primary sources, like letters and photos, come from the time being studied.",
   "q": "A letter written in 1900 is a...?",
   "o": [
    "Textbook summary",
    "Primary source",
    "Opinion"
   ],
   "a": 1
  },
  {
   "t": "Timelines",
   "x": "A timeline puts events in order so you can see cause and effect.",
   "q": "A timeline shows events in...?",
   "o": [
    "Time order",
    "Random order",
    "Alphabetical order"
   ],
   "a": 0
  },
  {
   "t": "Cause and effect",
   "x": "Historians ask why events happened (causes) and what changed after (effects).",
   "q": "What changed afterwards is the...?",
   "o": [
    "Cause",
    "Source",
    "Effect"
   ],
   "a": 2
  }
 ],
 "Psychology Basics": [
  {
   "t": "What it is",
   "x": "Psychology is the scientific study of mind and behaviour.",
   "q": "Psychology studies...?",
   "o": [
    "Rocks",
    "Mind and behaviour",
    "Only money"
   ],
   "a": 1
  },
  {
   "t": "Memory",
   "x": "Memory has stages: encoding, storage and retrieval. Repeating information helps store it.",
   "q": "Which helps store information?",
   "o": [
    "Ignoring it",
    "Sleeping less",
    "Repetition"
   ],
   "a": 2
  },
  {
   "t": "Motivation",
   "x": "Intrinsic motivation comes from within, like enjoying learning. Extrinsic comes from rewards.",
   "q": "Enjoying learning for its own sake is...?",
   "o": [
    "Extrinsic",
    "Intrinsic",
    "Neither"
   ],
   "a": 1
  }
 ],
 "Creative Thinking": [
  {
   "t": "Brainstorming",
   "x": "In brainstorming, write many ideas first and judge them later.",
   "q": "In brainstorming you first...?",
   "o": [
    "Judge every idea",
    "Stay silent",
    "Write many ideas"
   ],
   "a": 2
  },
  {
   "t": "Different angles",
   "x": "Looking at a problem from a new angle can reveal new solutions.",
   "q": "Why change your angle?",
   "o": [
    "To find new solutions",
    "To avoid thinking",
    "To copy others"
   ],
   "a": 0
  },
  {
   "t": "Mind maps",
   "x": "A mind map puts the main idea in the centre with branches for related ideas.",
   "q": "In a mind map the main idea goes...?",
   "o": [
    "At the edge",
    "Nowhere",
    "In the centre"
   ],
   "a": 2
  }
 ]
};
const WORDS=["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "practice", "makes", "perfect", "learn", "little", "every", "day", "focus", "keep", "going", "simple", "mind", "train", "brain", "study", "read", "write", "think", "speed", "accuracy", "steady", "habit", "goal", "reward", "effort", "improve", "skill", "typing", "keyboard", "finger", "home", "row", "letter", "rhythm", "smooth", "correct", "mistake", "lesson", "course", "quiz", "answer", "question", "memory", "notes", "revise", "exam", "result", "progress", "level", "badge", "streak", "today", "tomorrow", "morning", "evening", "quiet", "water", "green", "yellow", "purple", "orange", "window", "garden", "bridge", "planet", "rocket", "silver", "forest", "river", "mountain", "journey", "library", "teacher", "student", "science", "history", "finance", "market", "energy", "nature", "culture", "design", "vision", "wisdom", "future"];
