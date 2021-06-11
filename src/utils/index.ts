import fetch from 'node-fetch';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import gkeys from '../googlekeys.json';
dotenv.config();

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

export const getWeather = async (): Promise<string> => {
  const coordinates = {
    office: {
      lat: '33.7465549',
      lon: '-117.9100623',
    },
  };
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.office.lat}&lon=${coordinates.office.lon}&units=imperial&exclude=hourly,daily,minutely&appid=${process.env.OPEN_WEATHER_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const jsonResponse = await response.json();
    if (jsonResponse) {
      const currentTime = formatTime(jsonResponse.current.dt);
      const sunrise = formatTime(jsonResponse.current.sunrise);
      const sunset = formatTime(jsonResponse.current.sunset);
      const currentTemp = `${jsonResponse.current.temp} °F`;
      return `Weather: temperature: ${currentTemp}, current time: ${currentTime}, sunrise: ${sunrise}, sunset: ${sunset}.`;
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
