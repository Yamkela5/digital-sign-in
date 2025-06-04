 const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const preview = document.getElementById('preview');

    // Access camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((err) => {
        alert("Camera access denied: " + err);
      });

    // Capture face and redirect
    captureBtn.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Hide video and button, show preview
      video.style.display = 'none';
      captureBtn.style.display = 'none';
      preview.src = canvas.toDataURL('image/png');
      preview.style.display = 'block';

      // Show success message
      const messageDiv = document.createElement('div');
      messageDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="green" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm3.97-8.03a.75.75 0 0 1 0 1.06L7.477 12.53a.75.75 0 0 1-1.06 0L4.03 10.142a.75.75 0 1 1 1.06-1.06l1.263 1.263 4.243-4.243a.75.75 0 0 1 1.06 0z"/>
        </svg>
        Face captured successfully! Redirecting...
      `;
      messageDiv.style.cssText = 'color:green; text-align:center; margin-top:15px; font-weight:bold;';
      preview.parentNode.insertBefore(messageDiv, preview.nextSibling);

      // Redirect after 2 seconds (adjust delay if needed)
      setTimeout(() => {
        window.location.href = 'candidate.html'
      }, 1000);
    });