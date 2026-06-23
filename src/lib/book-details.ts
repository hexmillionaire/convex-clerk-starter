/**
 * Book genre tags and short descriptions for the Bible index page.
 */

export type BookGenre =
  | "Law"
  | "History"
  | "Poetry"
  | "Major Prophet"
  | "Minor Prophet"
  | "Gospel"
  | "Epistle"
  | "Apocalyptic";

export const BOOK_DETAILS: Record<
  string,
  { genre: BookGenre; description: string }
> = {
  genesis: { genre: "Law", description: "Creation, the fall of man, and God's covenant with Abraham." },
  exodus: { genre: "Law", description: "Israel's deliverance from Egypt and the giving of the Law at Sinai." },
  leviticus: { genre: "Law", description: "Laws of worship, sacrifice, and holiness for Israel." },
  numbers: { genre: "Law", description: "Israel's wilderness wanderings and census of the tribes." },
  deuteronomy: { genre: "Law", description: "Moses' final sermons and the renewal of God's covenant." },
  joshua: { genre: "History", description: "The conquest and division of the Promised Land." },
  judges: { genre: "History", description: "Israel's cycle of sin, oppression, and deliverance by judges." },
  ruth: { genre: "History", description: "A Moabite woman's loyalty and place in the lineage of David." },
  "1-samuel": { genre: "History", description: "The rise of the monarchy under Saul and the anointing of David." },
  "2-samuel": { genre: "History", description: "David's reign as king over Israel." },
  "1-kings": { genre: "History", description: "Solomon's wisdom, the divided kingdom, and the prophets." },
  "2-kings": { genre: "History", description: "The decline and fall of Israel and Judah." },
  "1-chronicles": { genre: "History", description: "Genealogies and David's reign from a priestly perspective." },
  "2-chronicles": { genre: "History", description: "The kings of Judah and the temple worship." },
  ezra: { genre: "History", description: "The return from exile and rebuilding of the temple." },
  nehemiah: { genre: "History", description: "Rebuilding Jerusalem's walls and renewing the covenant." },
  esther: { genre: "History", description: "A Jewish queen saves her people from destruction in Persia." },
  job: { genre: "Poetry", description: "The problem of suffering and God's sovereignty." },
  psalms: { genre: "Poetry", description: "Songs of praise, prayer, lament, and thanksgiving." },
  proverbs: { genre: "Poetry", description: "Practical wisdom for daily life and godly character." },
  ecclesiastes: { genre: "Poetry", description: "The search for meaning and the fear of God." },
  "song-of-solomon": { genre: "Poetry", description: "A poetic celebration of love and devotion." },
  isaiah: { genre: "Major Prophet", description: "Warnings of judgment and promises of the coming Messiah." },
  jeremiah: { genre: "Major Prophet", description: "The weeping prophet's call to repentance before exile." },
  lamentations: { genre: "Poetry", description: "Mourning over the destruction of Jerusalem." },
  ezekiel: { genre: "Major Prophet", description: "Visions of God's glory and the future restoration of Israel." },
  daniel: { genre: "Major Prophet", description: "Faith in exile and apocalyptic visions of God's kingdom." },
  hosea: { genre: "Minor Prophet", description: "God's faithful love for an unfaithful people." },
  joel: { genre: "Minor Prophet", description: "The day of the LORD and the outpouring of the Spirit." },
  amos: { genre: "Minor Prophet", description: "Justice for the oppressed and judgment on complacency." },
  obadiah: { genre: "Minor Prophet", description: "Judgment against Edom for its pride and cruelty." },
  jonah: { genre: "Minor Prophet", description: "A reluctant prophet and God's mercy for Nineveh." },
  micah: { genre: "Minor Prophet", description: "Justice, mercy, and the promise of a ruler from Bethlehem." },
  nahum: { genre: "Minor Prophet", description: "The fall of Nineveh and God's judgment on Assyria." },
  habakkuk: { genre: "Minor Prophet", description: "Wrestling with God's justice and living by faith." },
  zephaniah: { genre: "Minor Prophet", description: "The coming day of the LORD and a humble remnant." },
  haggai: { genre: "Minor Prophet", description: "A call to rebuild the temple after exile." },
  zechariah: { genre: "Minor Prophet", description: "Visions of hope and the coming Messiah." },
  malachi: { genre: "Minor Prophet", description: "God's love, faithfulness, and call to return to him." },
  matthew: { genre: "Gospel", description: "Jesus as the promised Messiah and King of Israel." },
  mark: { genre: "Gospel", description: "The suffering servant — Jesus in action." },
  luke: { genre: "Gospel", description: "Jesus as the Son of Man, full of compassion for all people." },
  john: { genre: "Gospel", description: "Jesus as the Word made flesh — the Son of God." },
  acts: { genre: "History", description: "The birth of the Church and the spread of the gospel." },
  romans: { genre: "Epistle", description: "The gospel of grace — justification by faith." },
  "1-corinthians": { genre: "Epistle", description: "Addressing divisions, morality, and spiritual gifts." },
  "2-corinthians": { genre: "Epistle", description: "Paul's defense of his ministry and call to generosity." },
  galatians: { genre: "Epistle", description: "Freedom in Christ — salvation by grace, not works." },
  ephesians: { genre: "Epistle", description: "Unity in Christ and the armor of God." },
  philippians: { genre: "Epistle", description: "Joy and contentment in Christ amid suffering." },
  colossians: { genre: "Epistle", description: "The supremacy of Christ over all creation." },
  "1-thessalonians": { genre: "Epistle", description: "Encouragement and the return of Christ." },
  "2-thessalonians": { genre: "Epistle", description: "Standing firm and the day of the Lord." },
  "1-timothy": { genre: "Epistle", description: "Instructions for church leadership and sound doctrine." },
  "2-timothy": { genre: "Epistle", description: "Paul's final charge to endure and preach the Word." },
  titus: { genre: "Epistle", description: "Godly living and church order in Crete." },
  philemon: { genre: "Epistle", description: "A plea for Onesimus — forgiveness and reconciliation." },
  hebrews: { genre: "Epistle", description: "Christ's superiority and the new covenant." },
  james: { genre: "Epistle", description: "Faith in action — practical wisdom for believers." },
  "1-peter": { genre: "Epistle", description: "Hope and endurance through suffering." },
  "2-peter": { genre: "Epistle", description: "Growth in grace and warning against false teachers." },
  "1-john": { genre: "Epistle", description: "Walking in the light — love, truth, and assurance." },
  "2-john": { genre: "Epistle", description: "Truth and love in the face of false teaching." },
  "3-john": { genre: "Epistle", description: "Hospitality, truth, and faithful leadership." },
  jude: { genre: "Epistle", description: "Contending for the faith against false teachers." },
  revelation: { genre: "Apocalyptic", description: "Visions of the end times and the triumph of the Lamb." },
};
