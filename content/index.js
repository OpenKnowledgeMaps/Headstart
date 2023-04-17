const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { create, all, random } = require('mathjs');
const { exit } = require('process');
const { randomUUID } = require('crypto');

const math = create(all);

// Parse CLI arguments
const url = process.argv[2];

// Load the contents of the page into memory
console.log("Getting blog data...")
axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    console.log("Fetching blog content...")

    // Extract the text content of the page
    let textContent = $('body').text();

    if (textContent.length > 6000)
      textContent = textContent.substring(0, 6000);

    console.log("Summarizing using ChatGPT...")

    if (process.env.OPENAI_KEY === undefined || process.env.OPENAI_KEY === null || process.env.OPENAI_KEY === "") {
      console.error("Unable to access OpenAI API because OPENAI_KEY is not defined.");
      process.exit(1);
    }

    // Send API request to OpenAI's ChatGPT
    axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You will be a blog summarizing assistant."
          },
          {
            role: "system",
            content: "You receive the blog article URL and its textual content, and you will respond with the following structure: \n\nSummary: <summary>\nTitle: <title>\nAuthors: <authors>\nYear of Publication: <year published>\nSite title: <site title>\nKeywords: <keywords>\nCategory: <category>"
          },
          {
            role: "system",
            content: "Supported categories are: 'management', 'culture, values', 'networking, connections, influence', 'communications', 'problem solving', 'other'. You can only pick one category per blog post."
          },
          {
            role: "user",
            content: `Blog URL: ${url}\n\nContents: ${textContent}`
          }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.OPENAI_KEY
        }
      })
      .then(response => {

        console.log("Transforming content into JSON...")

        const { data } = response;
        console.log(data);
        const { choices } = data;
        console.log(choices);
        const content = choices[0].message.content;
        console.log(content);
        const summary = content.match(/Summary:\s+(.*)/m)[1];
        const title = content.match(/Title:\s+(.*)/m)[1];
        const authors = content.match(/Authors:\s+(.*)/m)[1];
        const publishDate = content.match(/Year of Publication:\s+(.*)/m)[1];
        const siteTitle = content.match(/Site title:\s+(.*)/m)[1];
        const keywords = content.match(/Keywords:\s+(.*)/m)[1];
        const category = content.match(/Category:\s+(.*)/m)[1];

        let areaID = 0;
        switch (category) {
          case "management": areaID = 2; break;
          case "culture, values": areaID = 1; break;
          case "career growth": areaID = 3; break;
          case "networking, connections, influence": areaID = 4; break;
          case 'communications': areaID = 5; break;
          case 'problem solving': areaID = 6; break;
          case 'other': areaID = 7; break;
        }

        // Append JSON object to a file containing a JSON array
        const obj = {
        "id": randomUUID(),
        "relation": "",
        "identifier": url,
        "title": title,
        "paper_abstract": summary,
        "published_in": siteTitle,
        "year": publishDate,
        "subject_orig": keywords,
        "subject": keywords,
        "authors": authors,
        "link": url,
        "oa_state": "2",
        "url": url,
        "relevance": 100,
        "lang_detected": "english",
        "x": "0.0336057408338733",
        "y": "0.0336057408338733",
        "cluster_labels": category,
        "area_uri": areaID,
        "area": category,
        "resulttype": "Blog Article"
      }
        console.log(JSON.stringify(obj));
        const jsonArray = JSON.parse(fs.readFileSync('output.json', 'utf8'));
        jsonArray.push(obj);
        fs.writeFileSync('output.json', JSON.stringify(jsonArray, null, 2));
      })
      .catch(error => {
        console.error(error?.response?.data || error)
      });
  })
  .catch(error => console.log(error));