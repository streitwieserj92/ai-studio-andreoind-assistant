import { AgentStep, AgentAction } from '../types';

export function parseCommandLocally(command: string, currentContext: string): { summary: string; steps: AgentStep[] } {
  const norm = command.toLowerCase().trim();
  let summary = 'Custom automation task';
  const steps: Omit<AgentStep, 'id' | 'status'>[] = [];

  const createId = () => Math.random().toString(36).substring(2, 9);

  // Helper to add standard wait step
  const addWait = (ms = 1200, desc = 'Waiting for UI to render...') => {
    steps.push({
      action: 'wait',
      target: 'timer',
      value: ms.toString(),
      description: desc,
    });
  };

  // Contextual Awareness First
  if ((norm.includes('send this') || norm.includes('share this') || norm.includes('forward this')) && currentContext !== 'home') {
    summary = `Contextual Share: ${currentContext}`;
    let dataType = 'content';
    if (currentContext === 'weather') dataType = 'weather forecast';
    if (currentContext === 'maps') dataType = 'directions link';
    if (currentContext === 'twitter') dataType = 'tweet';
    if (currentContext === 'spotify') dataType = 'song link';
    if (currentContext === 'email') dataType = 'email thread';

    steps.push({
      action: 'read_content',
      target: 'screen_context',
      description: `Analyzing currently active foreground app (${currentContext}) to determine what "this" refers to...`,
    });
    addWait(1000);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: `I see you are looking at ${currentContext}. I will share this ${dataType}.`,
      description: 'Verbalizing contextual awareness...',
    });
    steps.push({
      action: 'open_app',
      target: 'messages',
      description: 'Opening Messages app to share context...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: 'chat_with_sarah',
      description: 'Opening chat thread with Sarah...',
    });
    addWait(1000);
    steps.push({
      action: 'type',
      target: 'messages_input_text',
      value: `Check out this ${dataType} I was just looking at!`,
      description: `Typing contextual SMS message...`,
    });
    steps.push({
      action: 'tap',
      target: 'send_msg_btn',
      description: 'Tapping Send button...',
    });
    addWait(1200);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: `${dataType} shared successfully.`,
      description: 'Verbalizing share completion.',
    });

  } else if (norm.includes('meeting') && (norm.includes('prepare') || norm.includes('ready'))) {
    summary = 'Prepare for Meeting';
    
    // Step 1: Turn on Do Not Disturb
    steps.push({
      action: 'open_app',
      target: 'settings',
      description: 'Opening Settings to activate Do Not Disturb...',
    });
    addWait(1200);
    steps.push({
      action: 'tap',
      target: 'toggle_dnd',
      description: 'Tapping Do Not Disturb toggle switch...',
    });
    addWait(1000);

    // Step 2: Mute Spotify
    steps.push({
      action: 'open_app',
      target: 'spotify',
      description: 'Opening Spotify to pause music...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: 'play_button',
      description: 'Tapping play/pause button to mute music...',
    });
    addWait(1000);

    // Step 3: Open Email
    steps.push({
      action: 'open_app',
      target: 'email',
      description: 'Opening Email app to review meeting agenda...',
    });
    addWait(1500);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: 'You are all set for the meeting. Do Not Disturb is on, music is paused, and emails are open.',
      description: 'Verbalizing meeting preparation completion...',
    });

  } else if (norm.includes('morning') && (norm.includes('routine') || norm.includes('briefing') || norm.includes('start'))) {
    summary = 'Morning Briefing & Start Routine';
    
    // Step 1: Open Weather and check forecast
    steps.push({
      action: 'open_app',
      target: 'weather',
      description: 'Opening Weather app to check the forecast...',
    });
    addWait(1500, 'Loading city forecast data...');
    steps.push({
      action: 'type',
      target: 'weather_search_input',
      value: 'San Francisco',
      description: 'Searching weather forecast for San Francisco...',
    });
    steps.push({
      action: 'tap',
      target: 'search_button',
      description: 'Tapping weather search button...',
    });
    addWait(1000);
    steps.push({
      action: 'read_content',
      target: 'weather_degrees',
      description: 'Reading temperature and morning weather details...',
    });
    steps.push({
      action: 'speak',
      target: 'voice',
      value: 'It is currently 68 degrees and sunny in San Francisco.',
      description: 'Speaking weather summary...',
    });

    // Step 2: Open Smart Home and turn lights on
    steps.push({
      action: 'open_app',
      target: 'smart_home',
      description: 'Opening Smart Home dashboard to prepare your environment...',
    });
    addWait(1200);
    steps.push({
      action: 'tap',
      target: 'toggle_living_room_light',
      description: 'Tapping switch to turn on Living Room Light...',
    });
    addWait(800);

    // Step 3: Open Email and draft recap
    steps.push({
      action: 'open_app',
      target: 'email',
      description: 'Opening Email app to draft a morning status update...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: 'compose_btn',
      description: 'Tapping Compose button...',
    });
    addWait(1000);
    steps.push({
      action: 'type',
      target: 'email_recipient',
      value: 'manager@company.com',
      description: 'Entering recipient manager@company.com...',
    });
    steps.push({
      action: 'type',
      target: 'email_subject',
      value: 'Morning Status & Weather Update',
      description: 'Entering email subject...',
    });
    steps.push({
      action: 'type',
      target: 'email_body',
      value: 'Good morning! The weather in SF is sunny and 68F. Starting my daily tasks now, lights are on, and ready for work!',
      description: 'Typing the morning report email body...',
    });
    steps.push({
      action: 'tap',
      target: 'send_btn',
      description: 'Tapping send to dispatch email report...',
    });
    addWait(1500);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: 'Morning briefing sequence completed. Emails sent and lights are active.',
      description: 'Verbalizing completion message...',
    });

  } else if (norm.includes('social') || norm.includes('broadcast') || norm.includes('tweet') && norm.includes('music')) {
    summary = 'Social Media Broadcast & Music Focus';
    
    // Open Twitter and Post
    steps.push({
      action: 'open_app',
      target: 'twitter',
      description: 'Opening Twitter to post updates...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: 'compose_tweet_btn',
      description: 'Tapping Compose Tweet button...',
    });
    addWait(1000);
    steps.push({
      action: 'type',
      target: 'twitter_compose_text',
      value: 'Automating complex tasks has never been easier. Android AI Agents are taking over! 🤖🚀 #automation #ai',
      description: 'Typing new status update...',
    });
    steps.push({
      action: 'tap',
      target: 'tweet_submit_btn',
      description: 'Tapping Post button to tweet...',
    });
    addWait(1500);

    // Open Spotify and play music
    steps.push({
      action: 'open_app',
      target: 'spotify',
      description: 'Opening Spotify to set a working vibe...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: 'track_row_1',
      description: 'Selecting "Chill Lofi Beats" track...',
    });
    steps.push({
      action: 'tap',
      target: 'play_button',
      description: 'Tapping play button to play track...',
    });
    addWait(1000);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: 'Tweet posted successfully and setting lofi background music.',
      description: 'Confirming social broadcast tasks completed.',
    });

  } else if (norm.includes('commute') || norm.includes('directions') || norm.includes('office') || norm.includes('maps')) {
    summary = 'Commute Calculator & Notifications';
    
    // Open Maps
    steps.push({
      action: 'open_app',
      target: 'maps',
      description: 'Opening Google Maps to check traffic...',
    });
    addWait(1500);
    steps.push({
      action: 'type',
      target: 'maps_search_input',
      value: 'Downtown Headquarters',
      description: 'Searching for target destination: Downtown Headquarters...',
    });
    steps.push({
      action: 'tap',
      target: 'get_directions_btn',
      description: 'Tapping directions button...',
    });
    addWait(1200);
    steps.push({
      action: 'read_content',
      target: 'maps_eta',
      description: 'Analyzing optimal route ETA...',
    });
    steps.push({
      action: 'tap',
      target: 'start_navigation_btn',
      description: 'Initiating navigation guidelines...',
    });
    addWait(1000);

    // Open Messages to notify contact
    steps.push({
      action: 'open_app',
      target: 'messages',
      description: 'Opening Messages app to update team members...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: 'chat_with_sarah',
      description: 'Opening chat thread with Sarah...',
    });
    addWait(1000);
    steps.push({
      action: 'type',
      target: 'messages_input_text',
      value: 'Hey Sarah, on my way to the office now. Maps calculates 25 minutes travel time, navigation is running!',
      description: 'Typing SMS update message...',
    });
    steps.push({
      action: 'tap',
      target: 'send_msg_btn',
      description: 'Tapping send button...',
    });
    addWait(1200);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: 'Navigation is started and Sarah was notified. Commute route looks clear.',
      description: 'Verbalizing navigation start...',
    });

  } else if (norm.includes('weather')) {
    // Extract city from query
    let city = 'New York';
    const cityMatches = command.match(/(?:weather in|weather for|at)\s+([a-zA-Z\s]+)/i);
    if (cityMatches && cityMatches[1]) {
      city = cityMatches[1].trim();
    }
    summary = `Check weather in ${city}`;

    steps.push({
      action: 'open_app',
      target: 'weather',
      description: `Opening Weather app to fetch forecast...`,
    });
    addWait(1500);
    steps.push({
      action: 'type',
      target: 'weather_search_input',
      value: city,
      description: `Typing city search: "${city}"...`,
    });
    steps.push({
      action: 'tap',
      target: 'search_button',
      description: 'Tapping weather search button...',
    });
    addWait(1200);
    steps.push({
      action: 'read_content',
      target: 'weather_degrees',
      description: `Reading temperature details in ${city}...`,
    });
    steps.push({
      action: 'speak',
      target: 'voice',
      value: `Successfully retrieved weather details for ${city}.`,
      description: `Announcing weather check completed.`,
    });

  } else if (norm.includes('email') || norm.includes('mail')) {
    summary = 'Draft and send Email';
    
    // Extract email data
    let recipient = 'colleague@work.com';
    let subject = 'Important Project Update';
    let body = 'Hi team, let us meet today to sync up on automation items.';

    if (norm.includes('boss') || norm.includes('manager')) {
      recipient = 'boss@company.com';
      subject = 'Weekly Performance Summary';
      body = 'Good day, please find my weekly progress notes attached to this thread.';
    }

    steps.push({
      action: 'open_app',
      target: 'email',
      description: 'Opening Email app...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: 'compose_btn',
      description: 'Tapping Compose button...',
    });
    addWait(1000);
    steps.push({
      action: 'type',
      target: 'email_recipient',
      value: recipient,
      description: `Entering recipient: ${recipient}...`,
    });
    steps.push({
      action: 'type',
      target: 'email_subject',
      value: subject,
      description: `Entering subject line: "${subject}"...`,
    });
    steps.push({
      action: 'type',
      target: 'email_body',
      value: body,
      description: 'Typing email body content...',
    });
    steps.push({
      action: 'tap',
      target: 'send_btn',
      description: 'Tapping Send button to dispatch email...',
    });
    addWait(1500);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: `Your email has been sent to ${recipient}.`,
      description: 'Verbalizing email status...',
    });

  } else if (norm.includes('spotify') || norm.includes('music') || norm.includes('song') || norm.includes('play')) {
    summary = 'Control Spotify Music Playback';
    
    steps.push({
      action: 'open_app',
      target: 'spotify',
      description: 'Opening Spotify player...',
    });
    addWait(1500);
    
    if (norm.includes('pause') || norm.includes('stop')) {
      steps.push({
        action: 'tap',
        target: 'play_button',
        description: 'Tapping pause button to stop music playback...',
      });
    } else {
      steps.push({
        action: 'tap',
        target: 'track_row_1',
        description: 'Selecting your favorite chill track...',
      });
      steps.push({
        action: 'tap',
        target: 'play_button',
        description: 'Tapping play button to start listening...',
      });
    }
    addWait(1000);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: norm.includes('pause') ? 'Music playback paused.' : 'Now playing music track on Spotify.',
      description: 'Speaking Spotify playback state...',
    });

  } else if (norm.includes('settings') || norm.includes('wifi') || norm.includes('bluetooth') || norm.includes('dnd') || norm.includes('dark mode')) {
    summary = 'Modify Device System Settings';

    steps.push({
      action: 'open_app',
      target: 'settings',
      description: 'Opening System Settings panel...',
    });
    addWait(1500);

    if (norm.includes('dark mode') || norm.includes('theme')) {
      steps.push({
        action: 'tap',
        target: 'toggle_dark_mode',
        description: 'Tapping switch to toggle system dark mode...',
      });
    } else if (norm.includes('wifi') || norm.includes('wi-fi')) {
      steps.push({
        action: 'tap',
        target: 'toggle_wifi',
        description: 'Tapping Wi-Fi connection toggle switch...',
      });
    } else if (norm.includes('bluetooth')) {
      steps.push({
        action: 'tap',
        target: 'toggle_bluetooth',
        description: 'Tapping Bluetooth connection switch...',
      });
    } else if (norm.includes('dnd') || norm.includes('do not disturb') || norm.includes('disturb')) {
      steps.push({
        action: 'tap',
        target: 'toggle_dnd',
        description: 'Tapping Do Not Disturb toggle switch...',
      });
    } else {
      steps.push({
        action: 'tap',
        target: 'toggle_wifi',
        description: 'Testing settings toggling...',
      });
    }
    addWait(1000);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: 'System parameters have been successfully toggled.',
      description: 'Speaking configuration completion.',
    });

  } else if (norm.includes('home') || norm.includes('light') || norm.includes('temp') || norm.includes('door') || norm.includes('lock') || norm.includes('thermostat')) {
    summary = 'Smart Home Device Control';

    steps.push({
      action: 'open_app',
      target: 'smart_home',
      description: 'Opening Smart Home Control hub...',
    });
    addWait(1500);

    if (norm.includes('light')) {
      steps.push({
        action: 'tap',
        target: 'toggle_living_room_light',
        description: 'Tapping switch to toggle Living Room Light...',
      });
    } else if (norm.includes('door') || norm.includes('lock')) {
      steps.push({
        action: 'tap',
        target: 'toggle_front_door_lock',
        description: 'Tapping lock button to toggle front door deadbolt...',
      });
    } else if (norm.includes('thermostat') || norm.includes('temp') || norm.includes('hot') || norm.includes('cold')) {
      steps.push({
        action: 'tap',
        target: norm.includes('hot') || norm.includes('up') || norm.includes('increase') ? 'thermostat_plus' : 'thermostat_minus',
        description: 'Adjusting thermostat setting by tapping controls...',
      });
    } else {
      steps.push({
        action: 'tap',
        target: 'toggle_living_room_light',
        description: 'Interacting with primary lighting fixture...',
      });
    }
    addWait(1000);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: 'Smart home action sent successfully.',
      description: 'Confirming home automation event dispatched.',
    });

  } else if (norm.includes('sms') || norm.includes('message') || norm.includes('text') || norm.includes('chat')) {
    summary = 'Send chat message to contact';
    
    // Extract contact name if possible
    let contact = 'sarah';
    let msgVal = 'Hello! Just checking in with you.';
    
    if (norm.includes('john')) contact = 'john';
    
    // Attempt to extract text from quotes or after "say"
    const textMatches = command.match(/(?:say|tell|send|texting)\s+["']?([^"']+)["']?/i);
    if (textMatches && textMatches[1]) {
      msgVal = textMatches[1];
    }

    steps.push({
      action: 'open_app',
      target: 'messages',
      description: 'Opening Messages chat history...',
    });
    addWait(1500);
    steps.push({
      action: 'tap',
      target: `chat_with_${contact}`,
      description: `Opening chat feed with ${contact.toUpperCase()}...`,
    });
    addWait(1000);
    steps.push({
      action: 'type',
      target: 'messages_input_text',
      value: msgVal,
      description: `Typing SMS message to send...`,
    });
    steps.push({
      action: 'tap',
      target: 'send_msg_btn',
      description: 'Tapping Send button...',
    });
    addWait(1200);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: `Message successfully dispatched to ${contact.toUpperCase()}.`,
      description: 'Verbalizing chat status...',
    });

  } else {
    // General fallback for unknown commands
    summary = `Execute: ${command}`;
    steps.push({
      action: 'open_app',
      target: 'settings',
      description: 'Opening System settings for general diagnostics...',
    });
    addWait(1200);
    steps.push({
      action: 'tap',
      target: 'toggle_wifi',
      description: 'Refreshing local wireless networks...',
    });
    addWait(1000);
    steps.push({
      action: 'open_app',
      target: 'home',
      description: 'Returning to Launcher Dashboard...',
    });
    addWait(1000);
    steps.push({
      action: 'speak',
      target: 'voice',
      value: `Custom sequence executed successfully.`,
      description: 'Verbalizing task diagnostics complete.',
    });
  }

  // Map steps with indices and standard formats
  const finalSteps: AgentStep[] = steps.map((s, index) => ({
    id: `${createId()}-${index}`,
    action: s.action,
    target: s.target,
    value: s.value,
    description: s.description,
    status: 'pending',
  }));

  return { summary, steps: finalSteps };
}
