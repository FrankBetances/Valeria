// ============================================================================
// Valeria+ · Academy — Knowledge Capsules in US English (V2.0)
// Pure module containing caregiver training content translated and adapted for
// US English (Pediatric HealthTech). Follows strict clinical terminology
// ("caregiver", "child", Sentence case, HIPAA-ready).
// ============================================================================
import { AcademyCapsule, AcademyTrack } from "./academyTypes";
import { academyAshaMilestonesEn } from "./capsulas/valeriaAcademyAsha";

export const TRACK_ACCENT_EN: Record<AcademyTrack, { bg: string; fg: string; label: string }> = {
  desarrollo: { bg: "#e0edff", fg: "#3b6fd4", label: "HOW CHILDREN LEARN TO TALK" },
  tpr:        { bg: "#d6f5f2", fg: "#00a39e", label: "WHY TOTAL PHYSICAL RESPONSE" },
  vicios:     { bg: "#fdeef2", fg: "#c2477e", label: "HABITS TO AVOID" },
  mediada:    { bg: "#fff1dc", fg: "#d98a1f", label: "CAREGIVER-MEDIATED THERAPY" },
  mitos:      { bg: "#ffe9e4", fg: "#cf4b39", label: "MYTH OR FACT?" },
};

export const ACADEMY_CAPSULES_EN: AcademyCapsule[] = [
  // ================================================================ LANGUAGE
  // --------------------------------------------------------------- ASHA Compass
  academyAshaMilestonesEn,
  // --------------------------------------------------------------- development
  {
    id: "dev-input",
    domain: "lenguaje",
    track: "desarrollo",
    icon: "👂",
    title: "How much language do they need to hear?",
    summary: "Children learn to talk by listening long before they produce words.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🌊",
        heading: "Listen first, speak later",
        body: "A child’s brain builds language from the quantity and quality of speech they hear. We call this rich input the language bath. Before uttering their first word, your child has heard thousands of spoken repetitions.",
      },
      {
        icon: "🔁",
        heading: "Repetition consolidates meaning",
        body: "Repeating the same word across different everyday contexts (\"look at the dog,\" \"the dog is running,\" \"where is the dog?\") is precisely what the brain needs to secure meaning and acoustic pattern. Never hesitate to repeat.",
      },
      {
        icon: "🎧",
        heading: "Audition first (Auditory-Verbal method)",
        body: "In Auditory-Verbal Therapy, we prioritize hearing: we name before showing, so your child relies on active listening rather than lipreading or gestures alone. This is why many activities present the spoken model BEFORE revealing the picture.",
      },
    ],
    quiz: [
      {
        prompt: "Why does repetition help young children learn words?",
        options: [
          "It bores them and forces speech",
          "It strengthens auditory memory and links sound to meaning",
          "It is only necessary for children with hearing loss",
        ],
        answer: 1,
        rationale: "Hearing the same word in varied daily contexts allows the brain to map phonological patterns and semantic meaning.",
      },
      {
        prompt: "What is the \"language bath\" in daily routines?",
        options: [
          "Surrounding your child with rich, meaningful spoken language during everyday routines",
          "Playing recorded audio in the background all day",
          "Asking your child to repeat lists of words",
        ],
        answer: 0,
        rationale: "The language bath is intentional, interactive speech addressed directly to the child during daily shared moments.",
      },
    ],
  },
  {
    id: "dev-turnos",
    domain: "lenguaje",
    track: "desarrollo",
    icon: "🏓",
    title: "What if you listened before speaking?",
    summary: "Communication is like ping-pong: speak, pause, and wait for your child’s turn.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "⏳",
        heading: "The power of the 5-second pause",
        body: "Children need time to process incoming speech and formulate a response. Waiting 5 full seconds after you speak gives your child the processing window needed to take their conversational turn.",
      },
      {
        icon: "👀",
        heading: "Every signal counts as a turn",
        body: "A look, a vocalization, a point, or a smile is a communicative turn. Acknowledge and respond to every attempt as if it were a full sentence, keeping the conversational exchange alive.",
      },
      {
        icon: "🗣️",
        heading: "Avoid continuous monologues",
        body: "Talking non-stop without pauses does not invite conversation. Speak, pause with an expectant look, and give your child room to jump in.",
      },
    ],
    quiz: [
      {
        prompt: "How long should you pause after speaking to give your child time to respond?",
        options: [
          "At least 5 seconds of expectant waiting",
          "No pause at all, keep talking",
          "Only 1 second",
        ],
        answer: 0,
        rationale: "A 5-second expectant pause provides the necessary processing window for emerging communicators.",
      },
      {
        prompt: "What counts as a conversational turn from a young child?",
        options: [
          "A vocalization, a gaze shift, a point, or a word",
          "Only full, grammatically correct sentences",
          "Only when they say \"please\" and \"thank you\"",
        ],
        answer: 0,
        rationale: "Early conversational turns include pre-linguistic vocalizations, eye contact, and gestures.",
      },
    ],
  },
  {
    id: "tpr-porque",
    domain: "lenguaje",
    track: "tpr",
    icon: "🤸",
    title: "Why move your body?",
    summary: "Total Physical Response (TPR) links words to physical movement for deeper learning.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🧠",
        heading: "Words you can feel in your body",
        body: "When a child pairs a spoken command with a motor action (jumping, clapping, touching their nose), motor memory directly anchors language comprehension in the brain.",
      },
      {
        icon: "😌",
        heading: "Zero pressure to produce speech",
        body: "TPR allows children to demonstrate comprehension through physical action before they are ready to produce words verbally, removing performance anxiety.",
      },
      {
        icon: "🎉",
        heading: "Playful and natural engagement",
        body: "Physical movement keeps therapy playful, energetic, and completely natural in the home environment.",
      },
    ],
    quiz: [
      {
        prompt: "What is the primary benefit of Total Physical Response (TPR)?",
        options: [
          "It anchors language comprehension through bodily movement without verbal pressure",
          "It replaces verbal speech entirely",
          "It is only used for physical exercise",
        ],
        answer: 0,
        rationale: "TPR connects auditory comprehension directly to physical action, reducing performance anxiety.",
      },
    ],
  },
  {
    id: "vicio-corregir",
    domain: "lenguaje",
    track: "vicios",
    icon: "🚫",
    title: "What if you recast instead of correcting?",
    summary: "Instead of saying \"that is wrong,\" repeat the sentence correctly and naturally.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "✨",
        heading: "Recasting over correcting",
        body: "When your child says \"doggy runned,\" avoid saying \"no, say ran.\" Instead, respond enthusiastically: \"Yes! The doggy RAN so fast!\" You model the correct form while validating their idea.",
      },
      {
        icon: "💬",
        heading: "Protect their desire to communicate",
        body: "Direct correction causes self-consciousness and reluctance to speak. Recasting provides the correct model without penalizing their effort.",
      },
      {
        icon: "🌱",
        heading: "Effortless grammatical growth",
        body: "Children naturally absorb corrected syntax when modeled repeatedly in conversational replies.",
      },
    ],
    quiz: [
      {
        prompt: "If your child says \"nana\" for banana, what is the best caregiver response?",
        options: [
          "\"Say it right: ba-na-na\"",
          "\"Yes! You want a yellow BANANA!\"",
          "Refuse to give it until they pronounce it correctly",
        ],
        answer: 1,
        rationale: "Recasting provides the correct phonological model naturally without penalizing communication.",
      },
    ],
  },
  {
    id: "vicio-preguntas",
    domain: "lenguaje",
    track: "vicios",
    icon: "❓",
    title: "How to assess without them noticing?",
    summary: "Replace constant questioning with descriptive comments and observations.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🛑",
        heading: "Too many questions shut down speech",
        body: "Asking \"What color is this? What is that? Who is that?\" turns playtime into an oral exam and causes children to withdraw from conversation.",
      },
      {
        icon: "🎙️",
        heading: "The 3:1 comment-to-question ratio",
        body: "Aim to make three descriptive comments (\"Look at the tall tower! The blue car is fast. It is going up!\") for every single question you ask.",
      },
      {
        icon: "🌟",
        heading: "Modeling rich language freely",
        body: "Descriptive commentary provides language input without placing a burdensome demand on the child to produce answers.",
      },
    ],
    quiz: [
      {
        prompt: "What happens when adults ask too many questions during play?",
        options: [
          "It turns play into an exam and reduces spontaneous communication",
          "It makes children learn vocabulary three times faster",
          "It guarantees perfect grammar",
        ],
        answer: 0,
        rationale: "Excessive questioning creates conversational pressure; descriptive comments model language freely.",
      },
    ],
  },
  {
    id: "med-adulto",
    domain: "lenguaje",
    track: "mediada",
    icon: "🧑‍🏫",
    title: "Did you know you're already a therapist?",
    summary: "Speech-Language Pathologists guide the strategy, but you deliver the daily therapy.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🏡",
        heading: "Real growth happens at home",
        body: "A child spends one hour a week in the clinic and over eighty waking hours at home. The daily interactions with caregivers are where real language growth happens.",
      },
      {
        icon: "⏰",
        heading: "Consistency beats intensity",
        body: "Five to ten minutes of focused, intentional language interaction every day is far more effective than an overwhelming weekend marathon.",
      },
      {
        icon: "🚀",
        heading: "Empowered daily routines",
        body: "Valeria+ equips you with clinical strategies so you can turn daily routines (bath, meals, bedtime) into rich therapy opportunities.",
      },
    ],
    quiz: [
      {
        prompt: "Why is caregiver-mediated intervention so powerful in pediatric language development?",
        options: [
          "Because daily routines provide hundreds of natural, repetitive language opportunities",
          "Because professional therapists are unnecessary",
          "Because children only learn from their parents",
        ],
        answer: 0,
        rationale: "Caregivers have the frequency, emotional bond, and everyday context needed for sustained language acquisition.",
      },
    ],
  },
  {
    id: "dev-autoconversacion",
    domain: "lenguaje",
    track: "desarrollo",
    icon: "🎙️",
    title: "Why narrate what you see?",
    summary: "Use self-talk and parallel talk to describe daily actions in real time.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🗣️",
        heading: "Self-talk: Narrate your own actions",
        body: "Describe what you are doing as you do it: \"I am slicing the apple. Slice, slice, slice. Now I put the apple on the plate.\"",
      },
      {
        icon: "👶",
        heading: "Parallel talk: Narrate your child’s actions",
        body: "Describe what your child is doing without demanding responses: \"You are pushing the truck. Zoom! The truck is going under the chair.\"",
      },
      {
        icon: "🔗",
        heading: "Mapping words to the present moment",
        body: "Hearing words at the exact instant the action takes place helps the brain map verbal symbols directly to real-world experiences.",
      },
    ],
    quiz: [
      {
        prompt: "What is parallel talk?",
        options: [
          "Describing what your child is seeing and doing as they do it",
          "Talking to two children at the same time",
          "Repeating the same word in two languages",
        ],
        answer: 0,
        rationale: "Parallel talk narrates the child’s ongoing experience, providing immediate lexical mapping.",
      },
    ],
  },
  {
    id: "med-expansion",
    domain: "lenguaje",
    track: "mediada",
    icon: "🌱",
    title: "How to enrich what they say?",
    summary: "Take your child’s words and add one or two descriptive elements.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "➕",
        heading: "The plus-one rule",
        body: "If your child uses single words (\"car\"), respond with a two-word phrase (\"blue car,\" \"car goes\"). If they say two words (\"big dog\"), respond with three (\"big fluffy dog\").",
      },
      {
        icon: "🎨",
        heading: "Adding semantic richness",
        body: "You can add adjectives (colors, sizes), verbs (actions), or prepositions (locations) to expand their expressive horizons.",
      },
      {
        icon: "🎯",
        heading: "Keeping the next step within reach",
        body: "Expanding by just one or two words keeps the next linguistic step within your child’s zone of proximal development.",
      },
    ],
    quiz: [
      {
        prompt: "If your child says \"juice,\" how should you apply the plus-one expansion technique?",
        options: [
          "\"Cold juice!\" or \"More juice please!\"",
          "\"Say: I would like a delicious glass of orange juice\"",
          "Say nothing and hand them the juice",
        ],
        answer: 0,
        rationale: "The plus-one rule models the next developmental milestone without overwhelming the child.",
      },
    ],
  },

  // =============================================================== ARTICULATION
  // ------------------------------------------------------------------------ tpr
  {
    id: "dis-punto",
    domain: "dislalias",
    track: "tpr",
    icon: "👅",
    title: "Where does each speech sound take shape?",
    summary: "Articulation is a motor skill: teach where the tongue, teeth, and lips touch.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "👄",
        heading: "The mouth is an instrument",
        body: "Every speech sound requires precise positioning of the articulators: lips (/p/, /b/, /m/), teeth on lower lip (/f/, /v/), tongue tip behind upper teeth (/t/, /d/, /l/, /s/).",
      },
      {
        icon: "🪞",
        heading: "Tactile and visual cues",
        body: "Use mirrors, exaggerated lip models, and tactile cues (touching your throat for vocal cord vibration) so your child can feel where sounds are made.",
      },
      {
        icon: "🎉",
        heading: "Celebrate placement before perfection",
        body: "A child who achieves the correct oral placement is on the verge of mastering the sound; reward the motor attempt enthusiastically.",
      },
    ],
    quiz: [
      {
        prompt: "What is the first step in helping a child master a difficult speech sound?",
        options: [
          "Helping them see and feel where the articulators (lips, tongue, teeth) go",
          "Demanding they repeat the word 50 times in a row",
          "Waiting until they turn 8 years old",
        ],
        answer: 0,
        rationale: "Phonological articulation requires conscious motor placement before acoustic precision is achieved.",
      },
    ],
  },
  {
    id: "dis-edades",
    domain: "dislalias",
    track: "desarrollo",
    icon: "📅",
    title: "At what age is each speech sound learned?",
    summary: "Not all sounds develop at the same age: understand typical developmental norms.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "👶",
        heading: "Early sounds (ages 2–3)",
        body: "Vowels, along with /p/, /b/, /m/, /t/, /d/, /n/, develop earliest because they are visible on the lips and easy to produce.",
      },
      {
        icon: "🧒",
        heading: "Middle sounds (ages 3–4)",
        body: "Sounds like /k/, /g/, /f/, /s/, and /y/ typically emerge as motor coordination matures.",
      },
      {
        icon: "👦",
        heading: "Late sounds (ages 5–7)",
        body: "Complex sounds such as /r/, /l/, /th/, /ch/, /sh/, and consonant blends (bl, tr, str) take longer to stabilize.",
      },
    ],
    quiz: [
      {
        prompt: "Is it expected for a 3-year-old child to have difficulty producing the /r/ or /th/ sounds?",
        options: [
          "Yes, these are late-developing sounds that typically mature between ages 5 and 7",
          "No, all sounds must be perfect by age 2",
          "It indicates immediate need for surgical intervention",
        ],
        answer: 0,
        rationale: "Complex phonemes require advanced motor coordination and naturally mature later in development.",
      },
    ],
  },
  {
    id: "dis-erre",
    domain: "dislalias",
    track: "tpr",
    icon: "🐯",
    title: "How to tackle the /r/ sound with calm?",
    summary: "The /r/ phoneme requires fine motor coordination: avoid tension and practice smoothly.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "👅",
        heading: "The mechanics of /r/",
        body: "In American English, /r/ is produced either retroflexed (tongue tip curled slightly up/back) or bunched (tongue body raised toward the palate with sides bracing against upper molars).",
      },
      {
        icon: "🧘",
        heading: "Tension is the enemy",
        body: "Telling a child to \"try harder\" creates jaw and neck tension, which prevents the tongue from shaping smoothly.",
      },
      {
        icon: "🏎️",
        heading: "Playful motor sound effects",
        body: "Use playful sound effects (growling like a friendly bear, revving a race car engine) to elicit vocalic /r/ without stress.",
      },
    ],
    quiz: [
      {
        prompt: "Why does pressuring a child to say /r/ often backfire?",
        options: [
          "It creates oral and vocal tension, hindering the relaxed tongue positioning needed for /r/",
          "It makes their teeth grow crooked",
          "It has no effect on speech production",
        ],
        answer: 0,
        rationale: "Acoustic production of /r/ depends on flexible, relaxed tongue shaping; stress induces rigid tension.",
      },
    ],
  },
  {
    id: "dis-praxias",
    domain: "dislalias",
    track: "tpr",
    icon: "👄",
    title: "Does oral-motor agility practice really help?",
    summary: "Playful oral-motor exercises build awareness and coordination for speech.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🫧",
        heading: "Awareness before precision",
        body: "Blowing bubbles, making funny faces in the mirror, and clicking the tongue increase proprioception in the oral cavity.",
      },
      {
        icon: "🎯",
        heading: "Isolating independent movement",
        body: "Help your child move their tongue independently from their jaw (e.g. elevating the tongue tip while keeping the chin still).",
      },
      {
        icon: "🎉",
        heading: "Keep it joyful and brief",
        body: "Oral gymnastics should always be a joyful, silly game rather than a rigid chore.",
      },
    ],
    quiz: [
      {
        prompt: "How do mirror games and blowing activities support speech development?",
        options: [
          "They build oral-motor awareness, lip strength, and breath control",
          "They replace the need to practice words",
          "They directly change the shape of the vocal cords",
        ],
        answer: 0,
        rationale: "Proprioceptive awareness and breath support are foundational physical components of articulate speech.",
      },
    ],
  },
  {
    id: "dis-ar-gesto",
    domain: "dislalias",
    track: "tpr",
    icon: "🎯",
    title: "Why reward the motor gesture first?",
    summary: "In AR exercises, visual rewards trigger on correct mouth posture, not acoustic perfection.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🔄",
        heading: "Breaking the frustration loop",
        body: "When a child struggles to produce a clear sound, auditory feedback can feel discouraging. Augmented Reality isolates the motor gesture visually.",
      },
      {
        icon: "📷",
        heading: "The camera as a motor sensor",
        body: "The camera detects target lip and mouth postures (e.g. rounded lips for /w/ or /u/, wide smile for /ee/).",
      },
      {
        icon: "✨",
        heading: "Instant positive reinforcement",
        body: "Achieving the visual target instantly triggers a 3D animation, reinforcing the physical feeling of correct placement.",
      },
    ],
    quiz: [
      {
        prompt: "Why does AR-1 reward lip posture rather than microphone audio?",
        options: [
          "To reward correct oral motor placement without acoustic frustration",
          "Because phone microphones do not work with children",
          "To teach children to be silent",
        ],
        answer: 0,
        rationale: "Visual reinforcement of motor posture builds foundational articulatory confidence before vocal strain occurs.",
      },
    ],
  },

  // =================================================================== DYSLEXIA
  // --------------------------------------------------------------- development
  {
    id: "dlx-fonologica",
    domain: "dislexia",
    track: "desarrollo",
    icon: "🔤",
    title: "How to play with speech sounds?",
    summary: "Phonological awareness is the ability to hear and manipulate sounds in spoken words.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "👂",
        heading: "Listening before reading",
        body: "Before children connect letters on a page to sounds, they must hear that spoken words are made of individual sound units (phonemes).",
      },
      {
        icon: "👏",
        heading: "Clapping syllables",
        body: "Break spoken words into rhythmic beats: \"el-e-phant\" (3 claps), \"cat\" (1 clap).",
      },
      {
        icon: "🔍",
        heading: "Isolating first sounds",
        body: "Play guessing games: \"I spy with my little eye something that starts with the sound /s/... sun!\"",
      },
    ],
    quiz: [
      {
        prompt: "What is phonological awareness?",
        options: [
          "The ability to recognize, isolate, and manipulate spoken sounds in words",
          "The speed at which a child reads whole sentences",
          "Memorizing the letters of the alphabet",
        ],
        answer: 0,
        rationale: "Phonological awareness is purely auditory and serves as the single strongest predictor of reading success.",
      },
    ],
  },
  {
    id: "dlx-alerta",
    domain: "dislexia",
    track: "desarrollo",
    icon: "🚦",
    title: "What warning signs should we watch for?",
    summary: "Early indicators of phonological and emergent literacy challenges.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🎶",
        heading: "Difficulty with rhymes",
        body: "Struggling to identify words that rhyme (cat/bat/hat) by age 4–5.",
      },
      {
        icon: "🔄",
        heading: "Trouble with sound retrieval",
        body: "Frequently misnaming familiar items or confusing words with similar sounds (tornado/volcano).",
      },
      {
        icon: "📖",
        heading: "Letter-sound mapping",
        body: "Difficulty remembering letter names and their corresponding sounds despite consistent practice.",
      },
    ],
    quiz: [
      {
        prompt: "What is an early indicator that a child might benefit from phonological awareness support?",
        options: [
          "Persistent difficulty recognizing rhyming patterns and isolating first sounds in spoken words",
          "Enjoying picture books",
          "Learning to walk at 12 months",
        ],
        answer: 0,
        rationale: "Rhyme recognition and initial phoneme isolation are core early phonological milestones.",
      },
    ],
  },
  {
    id: "dlx-rimas",
    domain: "dislexia",
    track: "desarrollo",
    icon: "🎶",
    title: "Why do rhymes and syllables matter?",
    summary: "Harness the power of nursery rhymes, sound families, and syllable games.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "📚",
        heading: "Word families (-at, -op, -in)",
        body: "Show how changing the first sound creates new words: cat → bat → mat → hat.",
      },
      {
        icon: "🎵",
        heading: "Nursery rhymes and songs",
        body: "Rhythm and rhyme naturally highlight sound structures in auditory memory.",
      },
      {
        icon: "🔀",
        heading: "Silly sound substitutions",
        body: "Playfully swap sounds in familiar words: \"Let’s eat some /b/ananas... now /m/ananas!\"",
      },
    ],
    quiz: [
      {
        prompt: "Why are word family games (e.g. -at family: cat, bat, mat) so effective in early literacy?",
        options: [
          "They highlight how changing a single phoneme alters word meaning",
          "They force children to memorize word lists without thinking",
          "They teach cursive handwriting",
        ],
        answer: 0,
        rationale: "Word families demonstrate phonemic contrast and phoneme-grapheme consistency.",
      },
    ],
  },
  {
    id: "dlx-lectura-compartida",
    domain: "dislexia",
    track: "mediada",
    icon: "📚",
    title: "How to read together without pressure?",
    summary: "Make reading together an interactive conversation, not a test of reading speed.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "💬",
        heading: "Dialogic reading",
        body: "Talk about the illustrations, predict what happens next, and connect the story to your child’s real life.",
      },
      {
        icon: "👉",
        heading: "Point to words left-to-right",
        body: "Track text with your finger as you read left-to-right to build print awareness.",
      },
      {
        icon: "😌",
        heading: "Zero reading anxiety",
        body: "Never force a struggling reader to decode in front of others under time pressure.",
      },
    ],
    quiz: [
      {
        prompt: "What is the primary goal of shared dialogic reading?",
        options: [
          "To build vocabulary, comprehension, and joy around books through interactive conversation",
          "To time how many words per minute the child reads",
          "To test them on grammar rules",
        ],
        answer: 0,
        rationale: "Shared reading fosters oral vocabulary, narrative comprehension, and positive associations with literacy.",
      },
    ],
  },

  // ======================================================================= ASD
  // ------------------------------------------------------------------- mediated
  {
    id: "tea-anticipar",
    domain: "tea",
    track: "mediada",
    icon: "🧩",
    title: "Why does anticipation build security?",
    summary: "Helping autistic children prepare for transitions reduces anxiety and dysregulation.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🛡️",
        heading: "Predictability lowers stress",
        body: "Unexpected transitions or sudden activity changes can overwhelm sensory processing. Letting your child know what is coming next provides safety.",
      },
      {
        icon: "1️⃣",
        heading: "First / Then structure",
        body: "\"First we put on our shoes, then we go to the park.\" This simple formula creates clear expectations.",
      },
      {
        icon: "⏳",
        heading: "Countdowns and cues",
        body: "Use gentle warnings: \"In 2 minutes, it will be time to pack away the blocks.\"",
      },
    ],
    quiz: [
      {
        prompt: "Why is anticipation so beneficial for children on the autism spectrum?",
        options: [
          "It provides predictable structure and significantly reduces transition anxiety",
          "It eliminates the need for daily routines",
          "It forces them to obey orders faster",
        ],
        answer: 0,
        rationale: "Clear anticipation creates cognitive predictability, allowing the nervous system to prepare for state changes.",
      },
    ],
  },
  {
    id: "tea-visual",
    domain: "tea",
    track: "mediada",
    icon: "🖼️",
    title: "How do visual supports help communication?",
    summary: "Visual schedules and pictograms make abstract language concrete and permanent.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "👁️",
        heading: "Words disappear, pictures stay",
        body: "Spoken language vanishes the moment it is said. A visual icon or schedule remains visible and can be referenced at any time.",
      },
      {
        icon: "📋",
        heading: "Daily routine visual boards",
        body: "Display simple image sequences for morning routines, hygiene, or therapy sessions.",
      },
      {
        icon: "🌟",
        heading: "Empowering independence",
        body: "Visual cues allow children to complete steps independently without relying on constant verbal prompting.",
      },
    ],
    quiz: [
      {
        prompt: "What is a major advantage of visual supports over verbal instructions?",
        options: [
          "Visuals remain permanently available for the child to reference, unlike fleeting speech",
          "Visuals mean adults never need to speak again",
          "Visuals only work for non-verbal children",
        ],
        answer: 0,
        rationale: "Visual cues reduce working memory load by providing a persistent, concrete reference.",
      },
    ],
  },
  {
    id: "tea-pedir",
    domain: "tea",
    track: "tpr",
    icon: "🙌",
    title: "How to teach functional requests?",
    summary: "Give your child powerful communication tools to express needs and desires.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🎯",
        heading: "Motivation drives communication",
        body: "Start with the items your child desires most (bubbles, swings, favorite snacks, music).",
      },
      {
        icon: "🫙",
        heading: "Creating natural communication temptations",
        body: "Place desired toys in clear, closed containers so your child has a natural reason to communicate (\"help,\" \"open,\" \"more\").",
      },
      {
        icon: "🤝",
        heading: "Honoring any communication mode",
        body: "Honor gestures, signs, PECS, AAC devices, or spoken approximations immediately to show that communication is effective.",
      },
    ],
    quiz: [
      {
        prompt: "How can caregivers create natural communication temptations at home?",
        options: [
          "Placing favorite toys in visible but inaccessible spots so the child initiates a request",
          "Hiding all toys and refusing to play",
          "Anticipating every single need so the child never has to ask",
        ],
        answer: 0,
        rationale: "Communication temptations establish an authentic, self-motivated reason for the child to initiate interaction.",
      },
    ],
  },
  {
    id: "tea-intereses",
    domain: "tea",
    track: "desarrollo",
    icon: "🚂",
    title: "What if special interests were the doorway?",
    summary: "Join your child’s intense passions to build connection and language.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🚂",
        heading: "Follow their lead",
        body: "If your child loves trains, elevators, or dinosaur names, enter their world rather than redirecting away from it.",
      },
      {
        icon: "🌱",
        heading: "Expand from their passion",
        body: "Use train tracks to practice prepositions (over, under, through), colors, numbers, and turn-taking.",
      },
      {
        icon: "❤️",
        heading: "Shared joy and connection",
        body: "Connecting through their genuine interests creates authentic joint attention and deepens relational trust.",
      },
    ],
    quiz: [
      {
        prompt: "What is the most effective clinical way to utilize an autistic child’s special interests?",
        options: [
          "Join their interest and use it as a rich bridge for communication and shared connection",
          "Ban the interest completely during therapy",
          "Allow only 30 seconds of play per day",
        ],
        answer: 0,
        rationale: "Entering the child’s area of passion creates intrinsic motivation and authentic joint engagement.",
      },
    ],
  },

  // ============================================================= SIGN LANGUAGE
  // --------------------------------------------------------------- development
  {
    id: "lse-que-es",
    domain: "signos",
    track: "desarrollo",
    icon: "🤟",
    title: "Did you know sign language is a full language?",
    summary: "Sign language possesses its own complete grammar, syntax, and cultural richness.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🧠",
        heading: "Not mere gestures",
        body: "Sign language is a natural visual-spatial language with complex linguistic structures, not simple pantomime.",
      },
      {
        icon: "🔬",
        heading: "Brain processing",
        body: "The human brain processes visual sign language in the exact same linguistic regions (Broca’s and Wernicke’s areas) as spoken language.",
      },
      {
        icon: "🚪",
        heading: "Immediate access to language",
        body: "For deaf children or late talkers, sign language provides immediate, barrier-free access to rich early communication.",
      },
    ],
    quiz: [
      {
        prompt: "Is sign language simply a collection of informal gestures?",
        options: [
          "No, it is a fully formed language with its own rich grammar, syntax, and vocabulary",
          "Yes, it is identical to universal mime",
          "It is only a temporary code for English",
        ],
        answer: 0,
        rationale: "Sign languages are natural, linguistically complete human languages with full phonological and syntactic rules.",
      },
    ],
  },
  {
    id: "lse-no-frena",
    domain: "signos",
    track: "desarrollo",
    icon: "🌱",
    title: "Does signing delay speech?",
    summary: "Scientific evidence proves that signing accelerates speech and reduces communication frustration.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🌉",
        heading: "A bilingual bridge",
        body: "Decades of research demonstrate that introducing signs supports spoken language acquisition rather than hindering it.",
      },
      {
        icon: "😌",
        heading: "Reducing tantrums and frustration",
        body: "When young children can express \"milk,\" \"more,\" or \"hurt\" with their hands, communication breakdowns drop dramatically.",
      },
      {
        icon: "🚀",
        heading: "Visual and motor scaffolding",
        body: "Signing builds symbolic communication pathways in the brain that transfer directly into spoken vocabulary.",
      },
    ],
    quiz: [
      {
        prompt: "Does introducing signs to a young child delay their spoken language development?",
        options: [
          "No, research shows signing supports and often accelerates spoken language acquisition",
          "Yes, it prevents the vocal cords from ever working",
          "Only if used before 6 months of age",
        ],
        answer: 0,
        rationale: "Visual signs reinforce the symbolic understanding of language without competing with oral development.",
      },
    ],
  },
  {
    id: "lse-parametros",
    domain: "signos",
    track: "desarrollo",
    icon: "🧩",
    title: "What is a sign made of?",
    summary: "Every sign is composed of 5 visual-spatial parameters.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "✋",
        heading: "Handshape (Configuration)",
        body: "The specific shape the hand forms (open palm, fist, index finger, etc.).",
      },
      {
        icon: "📍",
        heading: "Location and Orientation",
        body: "Where the sign is positioned relative to the body (forehead, chest, neutral space) and the direction the palm faces.",
      },
      {
        icon: "💨",
        heading: "Movement and Facial Expression",
        body: "The direction and rhythm of movement, paired with essential non-manual facial grammatical markers.",
      },
    ],
    quiz: [
      {
        prompt: "What are the core parameters that define any sign in sign language?",
        options: [
          "Handshape, location, movement, palm orientation, and facial expression",
          "Loudness and pitch of the voice",
          "Color of clothing and lighting",
        ],
        answer: 0,
        rationale: "These 5 phonological parameters constitute the visual-spatial structure of signs.",
      },
    ],
  },
  {
    id: "lse-dactilologico",
    domain: "signos",
    track: "tpr",
    icon: "🔤",
    title: "How does the fingerspelling alphabet work?",
    summary: "Using the manual alphabet to spell proper names and specific terms.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🔤",
        heading: "Fingerspelling at home",
        body: "Each letter of the alphabet has a distinct handshape. It is used to spell names of people, places, or words without a dedicated sign.",
      },
      {
        icon: "🎯",
        heading: "Clear and steady execution",
        body: "Keep your hand steady at shoulder height, facing the person you are communicating with.",
      },
      {
        icon: "📖",
        heading: "Kinesthetic bridge to literacy",
        body: "Fingerspelling provides a concrete kinesthetic link between letter shapes and sounds during emergent literacy.",
      },
    ],
    quiz: [
      {
        prompt: "When is fingerspelling primarily used?",
        options: [
          "To spell proper names, unfamiliar words, or clarify specific vocabulary",
          "To spell out every single sentence in conversation",
          "Only in formal exams",
        ],
        answer: 0,
        rationale: "Fingerspelling complements vocabulary for proper nouns and specialized lexical items.",
      },
    ],
  },
  {
    id: "lse-primeros-signos",
    domain: "signos",
    track: "tpr",
    icon: "🙌",
    title: "What are the most useful first signs at home?",
    summary: "High-frequency functional signs that transform daily routines.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "⭐",
        heading: "Essential core signs",
        body: "Signs like MORE, FINISHED, EAT, DRINK, HELP, and WAIT empower immediate communication.",
      },
      {
        icon: "🗣️",
        heading: "Sign and speak together (Bimodal)",
        body: "Use bimodal input: produce the spoken word and the sign simultaneously during daily routines.",
      },
      {
        icon: "🎉",
        heading: "Celebrate early approximations",
        body: "Just like first spoken words (\"baba\" for bottle), a child’s first signs will be motor approximations. Celebrate and expand!",
      },
    ],
    quiz: [
      {
        prompt: "Which functional signs are most helpful to introduce first in daily home routines?",
        options: [
          "Core needs like MORE, FINISHED, EAT, DRINK, and HELP",
          "Abstract words like philosophy and geography",
          "Names of distant countries",
        ],
        answer: 0,
        rationale: "High-frequency functional signs address immediate daily desires and prevent communication frustration.",
      },
    ],
  },
  {
    id: "lse-donde-aprender",
    domain: "signos",
    track: "mediada",
    icon: "🧑‍🏫",
    title: "Where does authentic sign language learning happen?",
    summary: "Connect with the Deaf community and qualified native sign language instructors.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🤟",
        heading: "Learn from native signers",
        body: "Deaf associations and certified sign language instructors provide natural fluency, cultural nuance, and authentic modeling.",
      },
      {
        icon: "🏛️",
        heading: "Deaf culture and community",
        body: "Sign language is deeply intertwined with a rich community culture, heritage, and history.",
      },
      {
        icon: "👨‍👩‍👧",
        heading: "A family-wide learning journey",
        body: "When the whole family learns together, the home becomes a truly accessible, bilingual communication environment.",
      },
    ],
    quiz: [
      {
        prompt: "What is the best way for a family to develop authentic sign language fluency?",
        options: [
          "Learning from certified instructors and connecting with the Deaf community",
          "Watching 10-second social media clips with no context",
          "Reading a textbook without ever practicing",
        ],
        answer: 0,
        rationale: "Direct interaction with qualified deaf educators provides cultural depth and linguistic accuracy.",
      },
    ],
  },

  // ============================================================== MYTHS & FACTS
  // ---------------------------------------------------------------------- myths
  {
    id: "mito-imitacion",
    domain: "mitos",
    track: "mitos",
    icon: "🦜",
    title: "Do children learn to talk only by copying?",
    summary: "Language is an active brain construction, not passive mimicry.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "❌",
        heading: "The imitation myth",
        body: "Many people believe children learn speech simply by repeating what adults say like a parrot.",
      },
      {
        icon: "🔬",
        heading: "The scientific reality",
        body: "Children build internal grammatical rules and test them out (which is why they say \"I goed\" even though they never heard an adult say it).",
      },
      {
        icon: "💡",
        heading: "What actually accelerates speech",
        body: "Focus on meaningful conversation, active listening, and responsive interaction rather than forcing mindless drills.",
      },
    ],
    quiz: [
      {
        prompt: "Why is language learning more than simple imitation?",
        options: [
          "Because children actively construct internal rules of grammar and meaning from communicative interactions",
          "Because children only learn when reading books",
          "Because imitation never occurs in infancy",
        ],
        answer: 0,
        rationale: "Creative language production (e.g. overregularization) proves the brain generates grammar actively.",
      },
    ],
  },
  {
    id: "mito-esperar",
    domain: "mitos",
    track: "mitos",
    icon: "⏳",
    title: "Should you just wait for them to talk?",
    summary: "Early intervention is gentle, empowering, and dramatically more effective than waiting.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "⚠️",
        heading: "The \"wait-and-see\" trap",
        body: "Hearing \"boys talk later\" or \"Albert Einstein didn’t talk until age 4\" often delays needed support during critical neurodevelopmental windows.",
      },
      {
        icon: "🧠",
        heading: "The golden window (ages 0–3)",
        body: "The brain exhibits its highest neuroplasticity during the first three years of life.",
      },
      {
        icon: "🩺",
        heading: "Evaluation provides clarity",
        body: "A consultation with a Speech-Language Pathologist provides peace of mind, early strategies, and objective developmental clarity.",
      },
    ],
    quiz: [
      {
        prompt: "Why is early consultation with a Speech-Language Pathologist recommended if a delay is suspected?",
        options: [
          "Early intervention leverages maximum neuroplasticity and equips caregivers with immediate strategies",
          "Because every child must undergo clinical tests at age 1",
          "To prescribe medications",
        ],
        answer: 0,
        rationale: "Early intervention during critical neuroplasticity windows provides optimal developmental trajectories.",
      },
    ],
  },
  {
    id: "mito-pantallas",
    domain: "mitos",
    track: "mitos",
    icon: "📺",
    title: "Do videos really teach children to talk?",
    summary: "Passive screens do not teach language; interactive human relationships do.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "📺",
        heading: "The passive screen trap",
        body: "Believing that educational videos or speaking apps on television teach babies to talk is a widespread misconception.",
      },
      {
        icon: "🔬",
        heading: "The science of social contingency",
        body: "Research proves young children under age 3 cannot map language from passive 2D screens without live social contingency.",
      },
      {
        icon: "👨‍👩‍👧",
        heading: "Co-viewing makes the difference",
        body: "If screens are used, make them a shared conversation: point, comment, laugh, and interact together.",
      },
    ],
    quiz: [
      {
        prompt: "Why do passive videos fail to teach language to infants and toddlers?",
        options: [
          "Because language learning requires live, responsive human interaction and social contingency",
          "Because screens have the wrong colors",
          "Because videos are too short",
        ],
        answer: 0,
        rationale: "Children require socially contingent feedback from a live human communicator to acquire language.",
      },
    ],
  },
  {
    id: "mito-bilingue",
    domain: "mitos",
    track: "mitos",
    icon: "🌍",
    title: "Do two languages confuse the child?",
    summary: "The human brain is naturally equipped for multilingual development from birth.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "❌",
        heading: "The bilingual confusion myth",
        body: "Advising multilingual families to drop their heritage language so their child \"doesn’t get confused\" is medically outdated.",
      },
      {
        icon: "🧠",
        heading: "Bilingual brain flexibility",
        body: "Bilingualism does not cause language delay. The brain separates linguistic systems naturally from early infancy.",
      },
      {
        icon: "🗣️",
        heading: "Speak the language of your heart",
        body: "Speak to your child in the language you speak most fluently and emotionally; rich input in any language builds strong brain architecture.",
      },
    ],
    quiz: [
      {
        prompt: "Should a bilingual family drop their native language if their child has a speech delay?",
        options: [
          "No, rich home language input supports overall brain and language development without causing delay",
          "Yes, children can only learn one language at a time",
          "Only if the child has blue eyes",
        ],
        answer: 0,
        rationale: "Strong foundational language skills in a native tongue transfer directly to secondary language acquisition.",
      },
    ],
  },
  {
    id: "mito-frenillo",
    domain: "mitos",
    track: "mitos",
    icon: "👅",
    title: "Does clipping a tongue-tie fix everything?",
    summary: "Distinguishing true structural tongue-ties from phonological and language differences.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "🔍",
        heading: "The anatomical myth",
        body: "Blaming every speech delay or articulation difficulty on an anatomical tongue-tie (ankyloglossia) overlooks core speech mechanisms.",
      },
      {
        icon: "🧠",
        heading: "Motor coordination vs. anatomy",
        body: "Most speech clarity challenges are motor coordination or phonological development issues, not restrictive tissue.",
      },
      {
        icon: "🩺",
        heading: "Comprehensive functional evaluation",
        body: "A qualified team (SLP, pediatrician, ENT) evaluates functional tongue elevation and mobility before considering procedures.",
      },
    ],
    quiz: [
      {
        prompt: "Is surgery for tongue-tie an automatic cure for language delays?",
        options: [
          "No, language comprehension and expression are neurological, while speech requires comprehensive functional assessment",
          "Yes, it solves all communication problems overnight",
          "Surgery is always mandatory for every late talker",
        ],
        answer: 0,
        rationale: "Language development is a cognitive-linguistic process, distinct from minor oral-structural anatomical variations.",
      },
    ],
  },
  {
    id: "mito-tea",
    domain: "mitos",
    track: "mitos",
    icon: "🧩",
    title: "What myths exist about autism?",
    summary: "Dismantling outdated stereotypes about connection, emotion, and communication.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "❤️",
        heading: "Myth: \"Autistic children do not feel affection\"",
        body: "Autistic individuals experience deep emotions and attachment, expressing connection in unique, meaningful ways.",
      },
      {
        icon: "👂",
        heading: "Myth: \"Non-speaking means not understanding\"",
        body: "A child who does not produce speech often understands vast amounts of language and deserves rich linguistic input.",
      },
      {
        icon: "🌈",
        heading: "Neurodiversity-affirming approach",
        body: "We honor each child’s unique sensory profile, communication style, and individuality.",
      },
    ],
    quiz: [
      {
        prompt: "Does a non-speaking autistic child lack language comprehension?",
        options: [
          "No, receptive comprehension often far exceeds expressive oral speech production",
          "Yes, non-speaking implies zero understanding",
          "Understanding only develops after age 10",
        ],
        answer: 0,
        rationale: "Receptive understanding and expressive production are distinct neurological pathways.",
      },
    ],
  },
  {
    id: "mito-dislexia",
    domain: "mitos",
    track: "mitos",
    icon: "🔤",
    title: "What myths exist about dyslexia?",
    summary: "Dyslexia is a phonological processing difference, not a visual impairment or laziness.",
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: "👓",
        heading: "Myth: \"They just see letters backwards\"",
        body: "While letter reversals occur early on, dyslexia is primarily a neurobiological difference in phonological processing (mapping sounds to letters).",
      },
      {
        icon: "💡",
        heading: "Myth: \"It is a matter of intelligence\"",
        body: "Dyslexia is completely unrelated to intelligence; dyslexic thinkers are often creative, big-picture problem solvers.",
      },
      {
        icon: "📖",
        heading: "Structured literacy works",
        body: "Explicit, systematic phonological instruction and assistive technology empower dyslexic learners to thrive.",
      },
    ],
    quiz: [
      {
        prompt: "What is the primary underlying cause of dyslexia?",
        options: [
          "A neurobiological difference in phonological sound-to-letter processing, independent of intelligence",
          "Poor eyesight that requires stronger glasses",
          "Lack of motivation to read",
        ],
        answer: 0,
        rationale: "Dyslexia is rooted in phonological language processing differences, not visual or cognitive deficits.",
      },
    ],
  },
];
