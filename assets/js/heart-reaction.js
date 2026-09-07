const HEART_TOKEN_KEY = 'alphastar_heart_token_v1';
const HEART_REFRESH_MS = 15000;

let heartReactionState = {
  count: 0,
  liked: false
};
let heartRefreshTimer = null;

function getApiBaseUrl() {
  const configuredUrl = String(
    window.ALPHASTAR_API_BASE_URL ||
      window.ALPHASTAR_WEBSITE_CONFIG?.apiBaseUrl ||
      ''
  ).trim();

  return configuredUrl.replace(/\/+$/, '');
}

function getHeartVisitorToken() {
  try {
    const existingToken = localStorage.getItem(HEART_TOKEN_KEY);
    if (existingToken) {
      return existingToken;
    }

    const nextToken = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `heart-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(HEART_TOKEN_KEY, nextToken);
    return nextToken;
  } catch (error) {
    return `heart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function formatHeartCount(totalHearts) {
  if (totalHearts < 1000) {
    return String(totalHearts);
  }

  if (totalHearts < 10000) {
    return `${(totalHearts / 1000).toFixed(1)}k`;
  }

  return `${Math.round(totalHearts / 1000)}k`;
}

async function readHeartJsonResponse(response) {
  const raw = await response.text();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Invalid server response.');
  }
}

async function requestHeartEndpoint(url, fetchOptions) {
  const response = await fetch(url, fetchOptions);
  const payload = await readHeartJsonResponse(response);

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Unable to process your heart right now.');
  }

  return payload;
}

function updateHeartReactionUI(payload = {}, options = {}) {
  const button = document.getElementById('heart-reaction-btn');
  const countNode = document.getElementById('heart-reaction-count');
  const copyNode = document.getElementById('heart-reaction-copy');

  if (!button || !countNode || !copyNode) {
    return;
  }

  const totalHearts = Number(payload.count || 0);
  const liked = Boolean(payload.liked);
  const previousCount = heartReactionState.count;

  heartReactionState = {
    count: totalHearts,
    liked
  };

  countNode.textContent = formatHeartCount(totalHearts);
  countNode.setAttribute('aria-label', `${totalHearts} ${totalHearts === 1 ? 'heart' : 'hearts'}`);
  copyNode.textContent = liked
    ? 'heart count'
    : totalHearts === 0
      ? 'Be the first heart'
      : totalHearts === 1
        ? 'heart total'
        : 'hearts total';
  button.classList.toggle('is-liked', liked);
  button.classList.toggle('is-loading', Boolean(options.loading));
  button.setAttribute('aria-pressed', String(liked));
  button.disabled = liked || Boolean(options.loading);
  button.title = liked
    ? 'Thank you for sending a heart.'
    : 'Tap to send one heart to the clinic.';

  if (options.bump || totalHearts !== previousCount) {
    button.classList.remove('is-bumped');
    window.requestAnimationFrame(() => {
      button.classList.add('is-bumped');
      window.setTimeout(() => {
        button.classList.remove('is-bumped');
      }, 360);
    });
  }
}

async function fetchHeartReactionState(visitorToken) {
  return requestHeartEndpoint(
    `${getApiBaseUrl()}/public/hearts?visitor_token=${encodeURIComponent(visitorToken)}&t=${Date.now()}`,
    {
      cache: 'no-store',
      mode: 'cors'
    }
  );
}

async function refreshHeartReaction(visitorToken, options = {}) {
  const payload = await fetchHeartReactionState(visitorToken);
  updateHeartReactionUI(payload, options);
  return payload;
}

function startHeartRefresh(visitorToken) {
  clearInterval(heartRefreshTimer);
  heartRefreshTimer = window.setInterval(() => {
    refreshHeartReaction(visitorToken).catch(() => {
    });
  }, HEART_REFRESH_MS);
}

async function submitHeartReaction(visitorToken) {
  return requestHeartEndpoint(
    `${getApiBaseUrl()}/public/hearts`,
    {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        visitor_token: visitorToken
      })
    }
  );
}

window.addEventListener('DOMContentLoaded', async () => {
  const button = document.getElementById('heart-reaction-btn');
  const apiBaseUrl = getApiBaseUrl();
  if (!button) {
    return;
  }

  if (!apiBaseUrl) {
    button.disabled = true;
    button.setAttribute('aria-label', 'Heart reactions are currently unavailable');
    button.title = 'Heart reactions are currently unavailable.';
    return;
  }

  const visitorToken = getHeartVisitorToken();

  updateHeartReactionUI({ count: 0, liked: false }, { loading: true });

  try {
    await refreshHeartReaction(visitorToken);
  } catch (error) {
    updateHeartReactionUI({ count: 0, liked: false });
  }

  startHeartRefresh(visitorToken);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(heartRefreshTimer);
      return;
    }

    refreshHeartReaction(visitorToken).catch(() => {
    });
    startHeartRefresh(visitorToken);
  });

  button.addEventListener('click', async () => {
    if (button.classList.contains('is-liked') || button.disabled) {
      return;
    }

    updateHeartReactionUI(heartReactionState, { loading: true });

    try {
      const payload = await submitHeartReaction(visitorToken);
      updateHeartReactionUI(payload, { bump: !payload.already_liked });

      if (payload.success && typeof window.showSiteToast === 'function') {
        window.showSiteToast(payload.already_liked ? 'You already sent a heart.' : 'Thank you for sending a heart.');
      }
    } catch (error) {
      updateHeartReactionUI(heartReactionState);

      if (typeof window.showSiteToast === 'function') {
        window.showSiteToast(error instanceof Error ? error.message : 'Unable to save your heart right now. Please try again.');
      }
    }
  });
});
