const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

async function agentUseAnthropic(content) {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0,
        system: "Respond only with short poems.",
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": content
                    }
                ]
            }
        ]
    });
    console.log(msg);
}

agentUseAnthropic("Why is the ocean salty?");