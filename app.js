const database = {
  p1: {
    id: "p1",
    author: { name: "Mira", email: "mira@trendpulse.dev", verified: true },
    content: "Meet @sara at the hub #js #async",
    engagement: { likes: 12, shares: 2, comments: 4 },
    createdAt: "2026-04-01T09:00:00.000Z"
  },
  p2: {
    id: "p2",
    // author: { name: "ali", email: "ali@trendpulse.dev", verified: true },
    author: { name: "Rami", email: "invalid-email", verified: false },
    content: "Checkout #node tutorials",
    engagement: { likes: 3 },
    createdAt: "2026-04-02T11:30:00.000Z"
  },
  p3: {
    id: "p3",
    author: { name: "ali", email: "ali@trendpulse.dev", verified: true },
    content: "Checkout  @sara #node tutorials @sara  @rama  @ali @",
    engagement: { likes: 3 , shares: 2, comments: 4},
    createdAt: "2026-04-02T11:30:00.000Z"
  },
  p4: {
    id: "p4",
    author: { name: "mai", email: "invalid-email", verified: false },
    // author: { name: "ali", email: "ali@trendpulse.dev", verified: true },
    content: "Checkout #node tutorials",
    engagement: { likes: 3 },
    createdAt: "2026-04-02T11:30:00.000Z"
  }
};

//1) Rich post model
function describePostForUi(post) {
    let {id :title,author:{name:authorName}}=post;
    let mergeedPost={...post,
        meta: { channel: "web" } };

    let keysCount=Object.keys(mergeedPost).length;
  return {
    title,
    authorName,
    keysCount
  }; 
 
}

 console.log( describePostForUi(database.p1));


// 2) Safe nested reads
function getEngagementTotals(post) 
{
  return  {
      likes:post.engagement?.likes??0,
      shares:post.engagement?.shares??0,
      comments:post.engagement?.comments??0
  };

}

const x = { engagement: { likes: 5, shares: 1 } };
const y = { engagement: { likes: 2 } };
const z = {};

console.log( getEngagementTotals(x) );
console.log( getEngagementTotals(y) );
console.log( getEngagementTotals(z) );
console.log( getEngagementTotals(database.p1) );

// 3) Simulated async fetch
function fetchPostById(id) {

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = database[id];

      if (post) {
        resolve({...post});
      }
      else 
      {
        reject("NOT_FOUND");
      }
    }, 30);
  });
}
async function demoFetch(id) {
  try {
    const post = await fetchPostById(id);
    console.log("Fetched post(demoFetch):", post.id);
    return post;  
  } 
  catch (e) 
  {
    console.log("Error(demoFetch):", e);
    return `there is an error : ${e}`
  }
  finally 
  {
    console.log(`done(demoFetch)${id}`);
  }
}

// let x1=await fetchPostById(database.p1.id)
// // console.log("x1");
// console.log(x1);

// let x4=await fetchPostById("p222")////there is no try catch arround it

console.log("x3");
let x3= await demoFetch(database.p1.id) 
// console.log(x3);

console.log("x2");
let x2= await demoFetch("p222");
console.log(x2);


// 4) Regex: email, hashtags, mentions
const emailOk = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
const hashTag = /#[\w#]+/g;
const mention = /@[\w]+/g;
function analyzePostText(post) {
    const emailValid = emailOk.test(post.author?.email);
    const tags = post.content?.match(hashTag) || [];
    const mentions = post.content?.match(mention) || [];

    return {
      emailValid,
      tags,
      mentions
    };
};
console.log(analyzePostText(database.p2));
console.log(analyzePostText(database.p3));

// 5) Event loop: predict order

console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// synchronous first(callstack)
// 1 (sync)
// 4 (sync)
// Call stack is empty? go to microtask(microTasks has an priority on Task Queue )

// 3 (microtask - Promise)

// Then run macrotasks
// 2 (macrotask - setTimeout)

// Predicted print order
// 1, 4, 3, 2


// 6) Date format + live refresh timer

function formatIsoDateOnly(iso) {
  const d = new Date(iso);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // local time
  // YYYY-MM-DD in UTC or local — pick one and document
}

function startRefreshDemo(onTick) {
  let n = 0;
  const id = setInterval(() => {
    n++;
    onTick(n);
    if (n >= 3) clearInterval(id);
  }, 200);
}
startRefreshDemo((n) => {
  console.log("tick:", n);
});
let date=new Date();
console.log("date");
console.log(date);
console.log( formatIsoDateOnly(date));

console.log("example 2026-04-04T10:00:00.000Z");
console.log( formatIsoDateOnly("2026-04-04T10:00:00.000Z"));

// 7) Final orchestrator

async function runTrendPulsePhase2() {
  const ids = Object.keys(database);
  let datesFormatted=[];
  let countValidEmails=0;
  let trackFirstInvalidId=null;
  for (const id of ids) 
  {
    let post;
    try {
      post = await fetchPostById(id);
      console.log("Fetched (runTrendPulsePhase2):", post.id);
      
      let analysis =analyzePostText(post);
      
      if (!analysis.emailValid && trackFirstInvalidId == null) {
        trackFirstInvalidId = id;
      }
      
      if (analysis.emailValid) countValidEmails++;
      datesFormatted.unshift(formatIsoDateOnly(post.createdAt));


    } catch (e) {
      console.log("Error:", e);
    } finally {
      console.log("done");
    }
  }
  return {
    loaded:ids.length,
    validEmails:countValidEmails,
    invalidAuthorId:trackFirstInvalidId,
    datesFormatted:datesFormatted

  }
}
let runTrend= await runTrendPulsePhase2() 
console.log(runTrend);
