import fetch from 'node-fetch';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import gkeys from '../googlekeys.json';
import randomResponses from '../data/random-responses';
dotenv.config();

export const createResponse = async (dm: string, name: string): Promise<string> => {
  const greetings: string[] = ['hello', 'hi', 'hey', 'hola'];
  const words: string[] = ['problem', 'issue', "does't work", "didn't work", 'working'];
  const hw: string[] = ['computer', 'printer', 'internet'];
  const sw: string[] = ['netsuite', 'shopify'];
  const h: string[] = ['hungry', 'lunch', 'food', 'dinner'];
  if (greetings.some(v => dm.includes(v))) {
    return `Hello ${name} how are you?`;
  } else if (h.some(v => dm.includes(v))) {
    return `Sounds like your hungry, how about giving the wheel of lunch a try: https://wheelof.com/lunch/?zip=92703&query=lunch&radius=5`;
  } else if (sw.some(v => dm.includes(v))) {
    return `I see your having some sort of software issue. Please email or message jriv@suavecito.com for help.`;
  } else if (hw.some(v => dm.includes(v))) {
    return `I see your having some sort of hardware issue. Have you turned it off and on again? If you continue having issues please email or message jorge@suavecito.com for help.`;
  } else if (words.some(v => dm.includes(v))) {
    return `I see your having some sort of problem please message someone better equiped to help you. I'm not that smart yet.`;
  } else if (dm.includes('weather')) {
    return await getWeather();
  } else {
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  }
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);

  let hours: number | string = date.getHours();
  let minutes: number | string = date.getMinutes();
  let secends: number | string = date.getSeconds();

  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  secends = secends < 10 ? '0' + secends : secends;
  const strTime = hours + ':' + minutes + ':' + secends + ' ' + ampm;

  return strTime;
};

export const getWeather = async (zip: string = '92703'): Promise<string> => {
  try {
    if (parseInt(zip) && zip.length <= 5) { 
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const jsonResponse = await response.json();
      if (jsonResponse) {
        const location = jsonResponse.name;
        const currentTime = formatTime(jsonResponse.dt + jsonResponse.timezone);
        const sunrise = formatTime(jsonResponse.sys.sunrise + jsonResponse.timezone);
        const sunset = formatTime(jsonResponse.sys.sunset + jsonResponse.timezone);
        const currentTemp = `${jsonResponse.main.temp} °F`;
        const minTemp = `${jsonResponse.main.temp_min} °F`;
        const maxTemp = `${jsonResponse.main.temp_max} °F`;
        return `Weather Data for ${location}. Current Time: ${currentTime}. Sunrise: ${sunrise}. Sunset: ${sunset}. Current Temp: ${currentTemp}, with a low of ${minTemp} and a high of ${maxTemp}.`;
      }
    }
    
    return 'Could not get weather data.';
  } catch (e) {
    console.log('ERROR GETTING WEATHER DATA', e.message);
    return 'Could not get weather data.';
  }
};

const getJWT = () => {
  return new Promise(function (resolve, reject) {
    const jwtClient = new google.auth.JWT(gkeys.client_email, '', gkeys.private_key, [
      'https://www.googleapis.com/auth/chat.bot',
    ]);

    jwtClient.authorize(function (err, tokens) {
      if (err) {
        console.log('Error create JWT hangoutchat');
        reject(err);
      } else {
        resolve(tokens?.access_token);
      }
    });
  });
};

export const postMessage = (roomId: string, msg: string): Promise<never> => {
  return new Promise(function (resolve, reject) {
    getJWT()
      .then(async function (token) {
        try {
          const response = await fetch(`https://chat.googleapis.com/v1/${roomId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
              text: msg,
            }),
          });
          const jsonResponse = await response.json();
          console.log('JSON RESPONSE', jsonResponse);
        } catch (e) {
          console.log('ERROR', e.message);
        }
      })
      .catch(function (err) {
        reject(err);
      });
  });
};
