// Create an authentication provider
const authProvider = {
  getAccessToken: async () => {
    // Call getToken in auth.js
    return await getToken();
  },
};
// Initialize the Graph client
const graphClient = MicrosoftGraph.Client.initWithMiddleware({ authProvider });
//Get user info from Graph
async function getUser() {
  ensureScope("user.read");
  return await graphClient.api("/me").select("id,displayName").get();
}

async function getEvents() {
  ensureScope("Calendars.Read");
  return await graphClient.api("/me/events").get();
}

async function getMeetingId(meetingURI) {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'+meetingURI);
  ensureScope(
    "OnlineMeetingArtifact.Read.All,OnlineMeetings.Read,OnlineMeetings.ReadWrite"
  );
  let meetlink = `JoinWebUrl eq '${meetingURI}'`;
  return await graphClient.api("/me/onlineMeetings").filter(meetlink).get();
}

async function getTranscript(tid){
    ensureScope('OnlineMeetingTranscript.Read.All');
    let trans=`/me/onlineMeetings/${tid}/transcripts`;
    return await graphClient.api(trans).version('beta').get();
}


async function getContent(mid,tid){
    ensureScope('OnlineMeetingTranscript.Read.All');
    let con=`/me/onlineMeetings/${mid}/transcripts/${tid}/content`;
    return await graphClient.api(con).version('beta').header('Accept','application/vnd.openxmlformats-officedocument.wordprocessingml.document').get();
}

//https://graph.microsoft.com/v1.0/me/onlineMeetings?$filter=JoinWebUrl eq 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_YjAwNzdhZmItMmZkMC00NzZlLThhNDQtNWUxYWNkN2FiOTJm%40thread.v2/0?context=%7b%22Tid%22%3a%22d65b6567-29cc-4f9a-a699-7047acdd761d%22%2c%22Oid%22%3a%222e9085e1-fe92-42d1-80a5-a013801f538c%22%7d'
