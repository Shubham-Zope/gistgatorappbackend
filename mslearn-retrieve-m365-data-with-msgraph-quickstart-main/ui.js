// async function getTranscript(meetingURI){
//   console.log('Runnn');
//   const meetobj=await getMeetingId(meetingURI);
//   console.log(meetobj);
// }


async function displayUI() {
  await signIn();

  // Display info from user profile
  const user = await getUser();
  var userName = document.getElementById("userName");
  userName.innerText = user.displayName;

  // Display info from user profile
  const events = await getEvents();
  var userNameevents = document.getElementById("events");
  const myJSON = JSON.stringify(events["value"]);
  console.log(events["value"]["0"]["isOnlineMeeting"]);

  var newArray = events.value.filter((el) => el.isOnlineMeeting == true);
  listOfevents = "";
  const ids = new Object();
  userNameevents.innerHTML = "<u1>";
  newArray.forEach((event) => {
    let id ='b'+ Math.floor(Math.random() * 1000000);
    userNameevents.innerHTML += `<li><button id=${id} > ${event["subject"]} ${event["createdDateTime"]}  </button></li>`;
    ids[id] = event['onlineMeeting']['joinUrl'];
    // const meet=event['onlineMeeting']['joinUrl'];
    // document.getElementById(id).onclick = async (meet) => {
    //   console.log("Runnn");
    //   const meetobj = await getMeetingId(meet);
    //   console.log(meetobj);
    // };
    console.log(event["subject"], event["createdDateTime"]);
  });
  // console.log(newArray);

  userNameevents.innerHTML += "</ul>";

  console.log(ids);
  for (const [k, v] of Object.entries(ids)) {
    console.log(`${k}: ${v}`);
    document.getElementById(k).onclick = async () => {
      console.log(v);
      const meetobj = await getMeetingId(v);
      console.log(meetobj['value'][0]['id']);
      const trans = await getTranscript(meetobj['value'][0]['id']);
      console.log(trans['value'][0]['id']);
      const cont = await getContent(meetobj['value'][0]['id'],trans['value'][0]['id']);
      var binaryData = [];
      binaryData.push(cont);
      let url = window.URL.createObjectURL(new Blob(binaryData, {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}))
      console.log(url);


      // let url=window.URL.createObjectURL(cont);
      let div=document.getElementById("downloadtranscript");
      var atag = document.createElement('a');
      atag.href = url;
      atag.innerText="Download Transcript";
      div.appendChild(atag);
    };
  }

  // userNameevents.innerHTML ='<ul>' + newArray.map( function(event){
  //   console.log(event['subject']);
  //   // let id=Math.random();
  // return `<li><button onclick="${getTranscript(event['onlineMeeting']['joinUrl'])}; return false;">' ${event['subject']} ${event['createdDateTime']}  </button></li>`;
  // // document.getElementById(id).onclick=getTranscript(event['onlineMeeting']['joinUrl']);
  // // return htele;
  // }).join('') + '</ul>';

  // Hide login button and initial UI
  var signInButton = document.getElementById("signin");
  signInButton.style = "display: none";
  var content = document.getElementById("content");
  content.style = "display: block";
}

// https://graph.microsoft.com/v1.0/me/onlineMeetings?$filter=JoinWebUrl+eq+'https://teams.microsoft.com/l/meetup-join/19%3a07cfe057b5e448d59c092182ce68b6a4%40thread.tacv2/1672933316017?context=%7b%22Tid%22%3a%22d65b6567-29cc-4f9a-a699-7047acdd761d%22%2c%22Oid%22%3a%222e9085e1-fe92-42d1-80a5-a013801f538c%22%7d'
