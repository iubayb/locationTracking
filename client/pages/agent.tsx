import { css } from '@emotion/css';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your server URL

export default function Agent() {

  const [agent, setAgent] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [trackingStarted, setTrackingStarted] = useState(false);

  // Emit the agent name to the server when the form is submitted
  const handleSubmit = (name: string) => {
    setAgent(name);
    setTrackingStarted(true);
  };

  useEffect(() => {
    // Ask for permission to use the user's location
    const askPermission = () => {
      if (!navigator.permissions) {
        alert('Your browser does not support location tracking');
        return;
      }

      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setTrackingStarted(true);
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(() => {
            setTrackingStarted(true);
          });
        } else if (result.state === 'denied') {
          alert('Please enable location tracking to use this app');
        }
      });
    };

    if (!trackingStarted) {
      askPermission();
    }
  }, [trackingStarted]);

  useEffect(() => {
    if (trackingStarted) {

      socket.emit('set-agent-name', agent);
      // Set up the location tracking
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          // Emit the location data to the server when it updates
          socket.emit('position-change', {
            agent: agent,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, [agent, trackingStarted]);

  const Form = () => {
    const [name, setName] = useState('');
    return (
      <div className={css`
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-size: 1rem;
              gap: 1.2rem;
              button, input{
                font-size: 1.2rem;
                background-color: inherit;
                color: inherit;
                padding: 1rem 0;
                border: 1px solid #d2d2d2;
                outline: none;
                box-shadow: 0 0 .2rem #d3d3d3;
                transition: box-shadow .3s;
                &:hover{
                  box-shadow: 0 0 1rem #000;
                }
              }
              button{
                cursor: pointer;
                width: 320px;
              }
              input{
                width: 300px;
                padding-inline: 10px;
              }
  `}>
        <p>Please enter your full name</p>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => handleSubmit(name)} disabled={!location || !name}>Submit</button>
      </div>)
  }

  return agent ?
    <div className={css`
            display:flex;
            align-items: center; 
            justify-content: center;
            height:100vh; `}>
      <p>Hi {agent},<br />your location is being tracked
        <br />
        Current location: {location?.latitude}, {location?.longitude}
      </p>
    </div>
    : <Form />
}
