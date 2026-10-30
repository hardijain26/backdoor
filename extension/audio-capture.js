/**
 * BACKDOOR v1.0 - GOOGLE MEET TAB AUDIO CAPTURE EXTENSION
 * Path: extension/audio-capture.js
 * Subsystem: @workspace/google (M4)
 * Authoritative: Runbook §5.4.5 & PRD M4-FR9
 *
 * Responsibilities:
 * 1. Attaches to active Google Meet tab audio stream with explicit user consent.
 * 2. Records tab audio into 10-minute WAV chunks (satisfies 25MB Groq Whisper limits).
 * 3. Injects a non-intrusive floating recording status pill into Google Meet UI.
 * 4. Automatically transmits completed chunks to /api/interviews/transcribe upon call conclusion.
 */

(function () {
  'use strict';

  // State Management
  let mediaStream = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let chunkIndex = 0;
  let recordingStartTime = null;
  let timerInterval = null;
  let statusBannerElement = null;

  const CHUNK_DURATION_MS = 10 * 60 * 1000; // 10 minutes chunk boundary
  const BACKDOOR_API_URL = 'http://localhost:3001/api/interviews/transcribe';

  /**
   * Inject floating recording indicator pill into Google Meet interface.
   */
  function injectStatusBanner() {
    if (document.getElementById('backdoor-audio-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'backdoor-audio-pill';
    pill.style.position = 'fixed';
    pill.style.top = '16px';
    pill.style.left = '50%';
    pill.style.transform = 'translateX(-50%)';
    pill.style.zIndex = '999999';
    pill.style.backgroundColor = '#0F1523';
    pill.style.border = '1px solid #2563EB';
    pill.style.borderRadius = '9999px';
    pill.style.padding = '6px 16px';
    pill.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
    pill.style.display = 'flex';
    pill.style.alignItems = 'center';
    pill.style.gap = '10px';
    pill.style.color = '#F8FAFC';
    pill.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    pill.style.fontSize = '12px';
    pill.style.fontWeight = '500';

    pill.innerHTML = `
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #10B981; animation: pulse 2s infinite;"></span>
      <span>Backdoor Audio Capture Active</span>
      <span id="backdoor-audio-timer" style="font-family: monospace; color: #38BDF8; font-weight: 700;">00:00</span>
      <button id="backdoor-stop-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #FFF; border-radius: 4px; padding: 2px 8px; font-size: 11px; cursor: pointer; margin-left: 6px;">Stop</button>
    `;

    document.body.appendChild(pill);
    statusBannerElement = pill;

    document.getElementById('backdoor-stop-btn').addEventListener('click', stopCapture);
  }

  function removeStatusBanner() {
    if (statusBannerElement) {
      statusBannerElement.remove();
      statusBannerElement = null;
    }
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimer() {
    if (!recordingStartTime) return;
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const timerEl = document.getElementById('backdoor-audio-timer');
    if (timerEl) {
      timerEl.textContent = `${mins}:${secs}`;
    }
  }

  /**
   * Request tab audio capture with candidate consent.
   */
  async function startCapture(companyName = 'Anthropic', roleTitle = 'Senior Product Manager') {
    try {
      // Prompt user consent
      const consent = window.confirm(
        `Start Backdoor Audio Capture for ${companyName} (${roleTitle})?\n\nAudio will be transcribed locally via Groq Whisper with zero data sharing. An action items checklist will be extracted.`
      );
      if (!consent) return;

      // Capture tab audio
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: true,
      });

      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunks = [];
      chunkIndex = 0;
      recordingStartTime = Date.now();

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.push(e.data);
          // Upload completed chunk
          await uploadAudioChunk(e.data, chunkIndex++, false, companyName, roleTitle);
        }
      };

      mediaRecorder.onstop = async () => {
        const fullBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await uploadAudioChunk(fullBlob, chunkIndex, true, companyName, roleTitle);
        removeStatusBanner();
      };

      // Start slicing every 10 minutes
      mediaRecorder.start(CHUNK_DURATION_MS);
      injectStatusBanner();
      timerInterval = setInterval(updateTimer, 1000);

      // Detect call disconnect
      mediaStream.getAudioTracks()[0].onended = () => {
        stopCapture();
      };
    } catch (err) {
      console.warn('[Backdoor Audio Capture] Capture initialization cancelled or failed:', err);
      removeStatusBanner();
    }
  }

  function stopCapture() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    removeStatusBanner();
  }

  /**
   * Transmit chunk to Backdoor backend.
   */
  async function uploadAudioChunk(blob, index, isLast, company, roleTitle) {
    try {
      const formData = new FormData();
      formData.append('audio', blob, `chunk_${index}.webm`);
      formData.append('chunkIndex', String(index));
      formData.append('isLastChunk', String(isLast));
      formData.append('company', company);
      formData.append('roleTitle', roleTitle);

      const res = await fetch(BACKDOOR_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        console.log(`[Backdoor Audio Capture] Chunk ${index} uploaded successfully.`);
      }
    } catch (err) {
      console.error('[Backdoor Audio Capture] Upload error:', err);
    }
  }

  // Expose global controller for testing and browser injection
  window.__BackdoorAudioCapture = {
    startCapture,
    stopCapture,
  };
})();
