import { NextResponse } from "next/server";

const CURATED: Record<string, string> = {
  "John 3:16":
    "This verse captures the heart of the Gospel: God's love is so vast that He gave His only Son so that anyone who believes can receive eternal life. It's an invitation — not a command — open to everyone.",
  "Psalm 23:1":
    "David uses the metaphor of a shepherd to describe God's provision. When the Lord is your shepherd, you lack nothing essential — not guidance, not protection, not rest.",
  "Proverbs 3:5-6":
    "Solomon teaches that true wisdom starts with surrender. When we stop relying solely on our own logic and instead trust God's direction, He straightens even the most confusing paths.",
  "Philippians 4:13":
    "Paul isn't claiming superhuman ability — he's saying that in every circumstance, whether abundance or need, Christ gives him the strength to endure and be content.",
  "Romans 8:28":
    "Paul assures believers that God weaves even painful experiences into a greater purpose. This doesn't mean everything is good, but that God redeems everything for those who love Him.",
  "Isaiah 41:10":
    "God speaks directly to His people's fear: 'Don't be afraid, I am here.' His strength isn't distant — it's personal, holding you up when you feel weakest.",
  "Jeremiah 29:11":
    "Written to exiles in Babylon, this promise isn't about instant deliverance but about God's long-term faithfulness. Even in hardship, His plans lead to hope and a future.",
  "Matthew 11:28":
    "Jesus invites the weary — not the strong — to come to Him. His rest isn't laziness but relief from the crushing weight of trying to earn God's favor.",
  "Psalm 46:10":
    "'Be still' doesn't mean do nothing — it means stop striving and recognize that God is sovereign. In chaos, His authority remains absolute.",
  "Joshua 1:9":
    "As Joshua takes over from Moses, God's command is both a charge and a comfort: courage isn't the absence of fear, but moving forward knowing God goes with you.",
  "Psalm 119:105":
    "God's Word doesn't illuminate the entire road at once — it lights the next step. This verse invites daily, step-by-step trust in Scripture's guidance.",
  "Romans 12:2":
    "Paul calls believers to resist cultural conformity and instead let God reshape how they think. Transformation starts in the mind and flows into every decision.",
  "Hebrews 11:1":
    "Faith is defined not as blind belief but as confident assurance. It's trusting in what God has promised even when we can't yet see it fulfilled.",
  "Ephesians 2:8-9":
    "Salvation is a gift, not a paycheck. Paul eliminates any room for boasting — it's by grace through faith, and both come from God, not from our efforts.",
  "Psalm 27:1":
    "David contrasts light and darkness: when God is your light and salvation, fear loses its power. The question 'whom shall I fear?' expects the answer: no one.",
  "2 Timothy 1:7":
    "Paul reminds Timothy that the Spirit God gives isn't timidity but power, love, and self-discipline. Fear may come, but it doesn't come from God.",
  "Psalm 37:4":
    "Delighting in God doesn't mean He gives you whatever you want — it means as you draw closer to Him, your desires begin to align with His.",
  "Galatians 5:22-23":
    "The fruit of the Spirit isn't something you manufacture — it grows naturally as you walk with God. These nine qualities describe the character of Christ being formed in you.",
  "Matthew 6:33":
    "Jesus redirects our anxiety about material needs: pursue God's kingdom first, and He ensures everything else you need follows. It's a call to reorder priorities.",
  "Isaiah 40:31":
    "Waiting on God isn't passive — it's active trust. Those who wait find their strength renewed, able to endure beyond what their own energy could sustain.",
  "1 Peter 5:7":
    "Peter's command is simple: hand your worries to God because He genuinely cares about you. Anxiety was never meant to be carried alone.",
  "James 1:5":
    "If you lack wisdom, just ask. God doesn't scold you for not knowing — He gives generously and without finding fault. The only condition is asking in faith.",
  "Colossians 3:23":
    "Whatever work you do, do it wholeheartedly — not to impress people, but as service to God. This transforms even mundane tasks into acts of worship.",
  "Psalm 139:14":
    "David praises God for the miracle of being alive. You are 'fearfully and wonderfully made' — crafted with intention, not accidents.",
  "Romans 15:13":
    "Paul prays that believers would overflow with joy, peace, and hope — not from their own reserves, but through the power of the Holy Spirit.",
  "Psalm 91:1-2":
    "This psalm promises divine protection for those who dwell in God's presence. 'Abiding under His shadow' means making God your daily refuge, not just your emergency shelter.",
  "1 Corinthians 13:4-5":
    "Paul's description of love isn't romantic sentiment — it's a practical checklist. True love is patient, kind, and selfless. It's measured by action, not feeling.",
  "Psalm 34:8":
    "David invites personal experience: taste and see. Knowing God's goodness isn't just intellectual — it's something you experience firsthand.",
  "Proverbs 18:10":
    "God's name represents His character — faithful, strong, just. Running to Him isn't physical escape but spiritual refuge where you find true safety.",
  "Psalm 121:1-2":
    "The psalmist looks up — not to the hills themselves, but beyond them to God who made them. Help comes from the Creator of everything.",
  "Matthew 5:16":
    "Jesus calls believers to live visibly good lives — not for self-glory, but so others see your works and credit your Father in heaven.",
  "Psalm 1:1-2":
    "Blessing begins with what you avoid (ungodly counsel) and what you pursue (God's Word). Meditating on Scripture day and night is the path to a rooted, fruitful life.",
  "John 14:6":
    "Jesus makes an exclusive claim: He is the only way to the Father. It's not arrogance — it's an invitation to the one path that leads to life.",
  "2 Corinthians 5:17":
    "In Christ, your past doesn't define you. The old is gone and the new has come — not just improving who you were, but becoming something entirely new.",
  "Psalm 16:11":
    "David discovers that fullness of joy isn't found in circumstances but in God's presence. At His right hand are pleasures that never fade.",
};

export async function POST(request: Request) {
  let body: { reference?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { reference, text } = body;
  if (!reference || !text) {
    return NextResponse.json(
      { error: "Missing reference or text" },
      { status: 400 }
    );
  }

  // Check curated explanations first
  if (CURATED[reference]) {
    return NextResponse.json({ explanation: CURATED[reference] });
  }

  // If OpenAI key is available, use it
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 200,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "You are a Bible study assistant. Give a concise (2-3 sentence) explanation of the verse. Be warm, clear, and faithful to the text. Do not add denominational doctrine.",
            },
            {
              role: "user",
              content: `Explain this Bible verse:\n\n"${text}" — ${reference} (KJV)`,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const explanation =
          data.choices?.[0]?.message?.content?.trim() ??
          "Unable to load explanation right now.";
        return NextResponse.json({ explanation });
      }
    } catch {
      // fall through to generic response
    }
  }

  // Generic fallback
  return NextResponse.json({
    explanation: `This verse from ${reference} reminds us of God's enduring love and faithfulness. Take a moment to reflect on how it speaks to your life today.`,
  });
}
