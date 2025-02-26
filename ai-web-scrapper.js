const{OpenAI} = require('openai');
const fs = require('fs');
const toml = require('toml');
const cheerio = require('cheerio');
const Website = require('./website');
const secrets = toml.parse(fs.readFileSync('secrets.toml'));
const OpenAIApi = secrets.OPEN_AI_API_KEY;


const openai = new OpenAI({ apiKey: OpenAIApi });

const system_prompt = ` You are an assistant that analyses the contents of a wesite and 
provides a short summary, ignoring text that might be navitagion related. 
Respond in an organised and easy to interpret way.`;

function user_prompt_for(website){
    let user_prompt = `You are analyzing the content of this website: ${website.title}.\n 
    The content of the website is as follows. Please provide a short summary of this website.\n
    If it includes news or announcements, then summarise them too.\n`;

    user_prompt += website.content;
    return user_prompt;
}

function message_for(website) {
    let userPrompt = user_prompt_for(website);
    // Remove tabs and replace 3 or more consecutive newlines with two newlines
    userPrompt = userPrompt.replace(/\t/g, '').replace(/\n{3,}/g, '\n\n');
    
    return [
        { role: 'system', content: system_prompt },
        { role: 'user', content: userPrompt }
    ];
}

async function summarise(url) {
    const website = await Website.fromUrl(url);   
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: message_for(website),
            max_tokens: 500
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error getting summary from OpenAI:', error);
        throw error;
    }
}

summarise('https://www.bbc.co.uk/news').then(console.log).catch(console.error);
