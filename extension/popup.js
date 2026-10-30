/**
 * BACKDOOR v1.0 - EXTENSION POPUP CONTROLLER
 * Path: extension/popup.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  const titleEl = document.getElementById('job-title');
  const companyEl = document.getElementById('job-company');
  const locationEl = document.getElementById('job-location');
  const btnClip = document.getElementById('btn-clip');
  const statusBox = document.getElementById('status-box');

  let detectedJob = null;

  try {
    // Query active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      titleEl.textContent = 'No active tab detected';
      return;
    }

    // Execute content script extraction in tab
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (typeof window.BackdoorClipper !== 'undefined') {
          return window.BackdoorClipper.extractJobFromPage(window.location.href, document);
        }
        return null;
      },
    });

    if (results && results[0] && results[0].result) {
      detectedJob = results[0].result;
      detectedJob.url = tab.url;

      titleEl.textContent = detectedJob.title || 'Product Manager';
      companyEl.textContent = detectedJob.company || 'Unknown Company';
      locationEl.textContent = detectedJob.location || 'Remote';

      btnClip.disabled = false;
    } else {
      titleEl.textContent = 'No job posting detected';
      companyEl.textContent = 'Navigate to LinkedIn, Greenhouse, Lever, Workday or Indeed';
    }
  } catch (err) {
    titleEl.textContent = 'Extraction unavailable';
    companyEl.textContent = err.message || 'Cannot access tab content';
  }

  // Handle Clip click
  btnClip.addEventListener('click', async () => {
    if (!detectedJob) return;

    btnClip.disabled = true;
    btnClip.textContent = 'Saving...';
    statusBox.className = 'status-area';
    statusBox.style.display = 'none';

    try {
      const response = await fetch('http://localhost:3001/api/ingest/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'clipper',
          title: detectedJob.title,
          company: detectedJob.company,
          location: detectedJob.location,
          description: detectedJob.description,
          applyUrl: detectedJob.url,
          source: detectedJob.source || 'chrome_clipper',
        }),
      });

      const data = await response.json();
      if (data.success) {
        statusBox.className = 'status-area status-success';
        statusBox.textContent = `✓ Saved! Fit Score: ${data.fitScore}%`;
        statusBox.style.display = 'block';
        btnClip.textContent = '✓ Saved to Backdoor';
      } else {
        statusBox.className = 'status-area status-error';
        statusBox.textContent = data.error || 'Ingest failed';
        statusBox.style.display = 'block';
        btnClip.disabled = false;
        btnClip.textContent = '⚡ Add to Backdoor';
      }
    } catch {
      statusBox.className = 'status-area status-error';
      statusBox.textContent = 'Network error: ensure Backdoor is running on localhost:3001';
      statusBox.style.display = 'block';
      btnClip.disabled = false;
      btnClip.textContent = '⚡ Add to Backdoor';
    }
  });
});

