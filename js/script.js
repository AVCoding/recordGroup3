  // const peer = new Peer('9de2dfb9-29f3-4d69-988b-734681133759');
  // const peer = new Peer();
// const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
// var id = Math.random().toString(16).slice(2)



// const { PeerServer } = require('peer');
// const peerServer = PeerServer({ host: 'localhost',port: 9000, path: '/' });


  const peer = new Peer({
      // host: '213.226.114.12',
      host: 'localhost',
      port: 9000,
      path: '/'
      // alive_timeout: 1000
    });
  var currentCall;
  peer.on("open", function (id) {
    document.getElementById("uuid").textContent = id;
  });




  $(document).on('click', '.disconnectbtn' , function(){

    peer.disconnect();
    alert('Disconnected');
    // $(this).parents('');
  
  });


  // start call
  async function callUser() {
    // get the id entered by the user
    const peerId = document.querySelector("input").value;
    // grab the camera and mic
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // switch to the video call and play the camera preview
    // document.getElementById("menu").style.display = "none";
    // document.getElementById("live").style.display = "block";
    // document.getElementById("local-video").srcObject = stream;
    // document.getElementById("local-video").play();
    // make the call

    var name = 'myname';
    const call = peer.call(peerId, stream, name);

    // console.log(call);

    // call.on("stream", (stream) => {
    //   document.getElementById("remote-video").srcObject = stream;
    //   document.getElementById("remote-video").play();
    // });
    // call.on("data", (stream) => {
    //   document.querySelector("#remote-video").srcObject = stream;
    // });


    // call.on("error", (err) => {
    //   console.log(err);
    //   alert('error in call user');
    // });
    call.on('close', () => {
      alert('closed');
      // endCall();
    })


    // save the close function
    currentCall = call;

  }




  peer.on('disconnected', function(id) { 
    console.log('on Disconect');
    // $('video-'+ id).css('display', 'none');
    // peer.reconnect();
  });

  peer.on('socket-error', function(err) { 
    alert('socket-closed');
  });


  // answer call
  peer.on("call", (call) => {
    if (confirm(`Accept call from ${call.peer}?`)) {
      // grab the camera and mic
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          // play the local preview
          // document.querySelector("#local-video").srcObject = stream;
          // document.querySelector("#local-video").play();
          // answer the call
          call.answer(stream);
          // save the close function
          currentCall = call;
          // change to the video view
          // document.querySelector("#menu").style.display = "none";
          // document.querySelector("#live").style.display = "block";
          call.on("stream", (remoteStream, name) => {

            alert(name);
            
            // when we receive the remote stream, play it

            // document.getElementById("remote-video").srcObject = remoteStream;
            // document.getElementById("remote-video").play();

            
            $("#video-" + call.peer).remove(); //Remove remote video if exists before
            $(".record-wrapper-" + call.peer).remove(); 
            
            // $("#video-list").append("<video id='video-" + call.peer + "' autoplay style='max-width: 400px;'></video>"); //Create new video element
            // $("#video-"+ call.peer).prop("srcObject", remoteStream); //Put stream to the video

            $("#video-list").append("<div class='live'> <video id='video-" + call.peer + "' autoplay style='max-width: 400px;' class='remote-video'></video> "
              + "<div data-record='"+ call.peer + "'  class='record-wrapper-" + call.peer +" rec'> <button class='btn'>record</button> <button class='stopbtn'>stop record</button> </div> </div> "); //Create new video element
            $("#video-"+ call.peer).prop("srcObject", remoteStream); //Put stream to the video


            setInterval(function(){
              console.log('ESA');
              console.log($("#video-"+ call.peer).prop("srcObject") );

            }, 4000);


          });



          peer.on('disconnected', function(e) { 
              alert('alert peer DISCONNECTED');

          });
          
          peer.on('error', function() { 
              // $("#video-" + call.peer).remove();
              alert('alert peer on error');
          });


        })
        .catch((err) => {
          console.log("Failed to get local stream:", err);
        });
    } else {
      // user rejected the call, close it
      call.close();
    }
  });





  // setInterval(function(){
  //   console.log(peer);

  //   if(peer != null && peer.disconnected == false && peer.destroyed
  //   == false && currentCall != null)
  //   {
  //     console.log('Connected to PeerServer');
  //   // document.getElementById("peerServerStatus").innerHTML = "Connected to PeerServer";
  //   }
  //   else
  //   {
  //     console.log('Not connected to PeerServer');
  //   }
  // }, 4000);





            

  function endCall() {
    // Go back to the menu
    // document.querySelector("#menu").style.display = "block";
    // document.querySelector("#live").style.display = "none";
    document.querySelector(".live").style.display = "none";
    // If there is no current call, return
    if (!currentCall) return;
    // Close the call, and reset the function
    try {
      currentCall.close();
    } catch {}
    currentCall = undefined;
  }





  // ============================================================>>>> RECORD STREAM

  // window.onload = function(){ 

  var mediaRecorder;
  var mediaArr = {};
  
  // record of video starts
  function videoRecOn(recID, currentVideo){
    console.log(recID);
    if (currentVideo.srcObject != null) {
        alert('ners');

        mediaArr[recID] =  new MediaRecorder(currentVideo.srcObject);
        mediaArr[recID].start(1000);
        var parts = [];

        mediaArr[recID].ondataavailable = function(e){      
          parts.push(e.data);
          console.log(parts);
        }
        mediaArr[recID]['blobParts'] = parts;

        console.log('mediaArr[recID].state');
        console.log(mediaArr[recID].state);
    }
    else{
      alert('no stream detected');
    }
  }
  // record of video stops
  function videoRecOff(recID){
    if ( mediaArr[recID] != undefined) {

      mediaArr[recID].stop();
      mediaArr[recID].onstop = function(e) {
        console.log('mediaArr[recID].state in OFF');
        console.log(mediaArr[recID].state);

        if ( mediaArr[recID]['blobParts'] ) {
          var blob =  new Blob(mediaArr[recID]['blobParts'], {
            type: 'video/webm'
            // type: 'video\/mp4'
          });
          const url =  URL.createObjectURL(blob);
          const a =  document.createElement('a');
          document.body.appendChild(a);
          // a.style = 'display: none';
          a.href =  url;
          a.text = 'jkbhsdjs';
          a.download = 'test.webm';
          // a.download = 'test.mp4';
          a.click();
          delete  mediaArr[recID];
          // currentCall.close();
        }


      }

    }    
  }
  
  // start record peer media - video , audio
  $(document).on('click', '.btn', function(el){

    alert('durs');
    console.log(el);

    el.target.parentElement.previousElementSibling.style.width = "100px";

    var recID =  $(this).parents('.rec').attr('data-record'); 
    alert(recID);

    var currentVideo =  el.target.parentElement.previousElementSibling;
    videoRecOn(recID, currentVideo);
  });
  // stop record peer media - video , audio
  $(document).on('click', '.stopbtn', function(){
      alert('stop');
      videoRecOff($(this).parents('.rec').attr('data-record'));
  });

  // ============================================================

  // $(document).on('click', '.btn', function(el){
  //     // const parts = [];
  //     // let mediaRecorder;

  //     // $('.btn').on('click', function(){
  //       alert('durs');
  //       console.log(el);
  //       // $(this).siblings('.remote-video').eq(0).css('width', '100px');
  //       el.target.parentElement.previousElementSibling.style.width = "100px";
  //       // var currentVideo = $(this).siblings('.remote-video').eq(0);
  //       // var currentVideo = document.querySelector('.remote-video');
  //       // console.log(document.getElementById('remote-video').srcObject);
  //       // if (document.getElementById('remote-video').srcObject != null) {
  //       var recID =  $(this).parents('.rec').attr('data-record') ; 
  //       alert(recID);

  //       var currentVideo =  el.target.parentElement.previousElementSibling;
  //       if (currentVideo.srcObject != null) {
  //         alert('ners');
  //         // alert( el.target.parentElement.getAttribute('data-record') );
  //         mediaRecorder = new MediaRecorder(currentVideo.srcObject);
  //         mediaRecorder.start(1000);

  //         mediaRecorder.ondataavailable = function(e){
  //           // parts.push(e.data);
  //           // alert(parts.length);
           
  //           for (var i = 0; i < parts.length; i++) {
  //             // if (parts[i].length > 1) {
  //               // parts[i].push(e.data);
  //               // console.log(el.data);


  //               // if (parts[i][recID] != undefined) {
  //               //   if (i == (parts.length - 1) ) {
  //               //     if (parts[i][recID]) {
  //               //       parts[i][recID] = [];
  //               //       parts[i][recID].push(e.data);
  //               //     }
  //               //   }
  //               //   if (parts[i][recID]) {
  //               //     parts[i][recID] = [];
  //               //     parts[i][recID].push(e.data);
  //               //   }
  //               //   else{
  //               //     parts[i][recID].push(e.data);
  //               //   }
                  
  //               // }
  //               // if (parts[i][recID] == undefined) {
  //               //   parts[i][recID] = [e.data];
  //               // } 


  //             // }

  //             // if (parts[i].length < 1) { 

  //               if (parts[i][recID] != undefined) {
  //                 parts[i][recID].push(e.data);
  //               }

  //               if (parts[i][recID] ==  undefined) {
  //                 parts[i][recID] =  [e.data];
  //               }

  //             // }
  //           }
  //           console.log(parts);
  //         }

  //         // mediaRecorder.onstop = e => export_media(new Blob(parts));

  //         mediaRecorder.onstop = function(e) {
  //           console.log("data available after MediaRecorder.stop() called.");

  //           var audio = document.createElement('audio');
  //           audio.controls = true;
  //           var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
  //           var audioURL = window.URL.createObjectURL(blob);
  //           audio.src = audioURL;
  //           console.log("recorder stopped");
  //         }


  //       }
  //       else{
  //         alert('no stream detected');
  //       }
  //     // });

  // });


  // $(document).on('click', '.stopbtn', function(){
  //   // $('.stopbtn').on('click', function(){

  //     alert('stop');
  //     // console.log($(this).eq());
  //     mediaRecorder.stop();
  //     // const blob =  new Blob(parts[0], {
  //     //   type: 'video/webm'
  //     // });

  //     // mediaRecorder.stop();

  //       for (var i = 0; i < parts.length; i++) {
  //         if ( parts[i][$(this).parents('.rec').attr('data-record')] ) {

  //           var blob =  new Blob(parts[i][$(this).parents('.rec').attr('data-record')], {
  //             type: 'video/webm'
  //             // type: 'video\/mp4'
  //           });
  //           const url =  URL.createObjectURL(blob);
  //           const a =  document.createElement('a');
  //           document.body.appendChild(a);
  //           // a.style = 'display: none';
  //           a.href =  url;
  //           a.text = 'jkbhsdjs';
  //           a.download = 'test.webm';
  //           // a.download = 'test.mp4';
  //           a.click();
  //           // delete parts[i][$(this).parents('.rec').attr('data-record')]; 
  //           // parts = [[]];

  //         }

  //       }


  //        parts = [[]]; 
    

  //     // const url =  URL.createObjectURL(blob);
  //     // const a =  document.createElement('a');
  //     // document.body.appendChild(a);
  //     // a.style = 'display: none';
  //     // a.href =  url;
  //     // a.download = 'test.webm';
  //     // a.click();



  //   // });
  // });

  // =======================================



// }










// window.onload = function(){ 
//   // const parts = [];
//   // let mediaRecorder;

//   // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
//   //   document.getElementById('local-video').srcObject = stream;

//   //   document.getElementById('btn').onclick = function(){
//   //     mediaRecorder = new MediaRecorder(stream);
//   //     mediaRecorder.start(1000);
//   //     mediaRecorder.ondataavailable = function(e){
//   //       parts.push(e.data);
//   //     }
//   //   };

//   // });

//   document.getElementById('stopbtn').onclick = function(){
//   mediaRecorder.stop();
//   const blob =  new Blob(parts, {
//     type: 'video/webm'
//   });
//   const url =  URL.createObjectURL(blob);
//   const a =  document.createElement('a');
//   document.body.appendChild(a);
//   a.style = 'display: none';
//   a.href =  url;
//   a.download = 'test.webm';
//   a.click();
// };


// }











