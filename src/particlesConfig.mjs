import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadConfettiPreset } from "@tsparticles/preset-confetti";

/**
 * @param {{ id: string; scrollPosition: number }} props
 * @returns JSX.Element
 */
const ParticlesComponent = (props) => {
  const { id, scrollPosition } = props; // Destructure the expected props
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadConfettiPreset(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log(container);
  };

  const options = {
    preset: "confetti",
    emitters: [
      {
        life: {
          duration: 7,
          count: 1,
        },
        position: {
          x: 10,
          y: 45,
        },
        rate: {
          delay: 0.1,
          quantity: 5,
        },
        size: {
          width: 100,
          height: 10,
        },
        particles: {
          move: {
            angle: {
              value: 135,
              offset: 0,
            },
            speed: 80,
          },
        },
      },
      {
        life: {
          duration: 7,
          count: 1,
        },
        position: {
          x: 82,
          y: 45,
        },
        rate: {
          delay: 0.1,
          quantity: 5,
        },
        size: {
          width: 100,
          height: 0,
        },
        particles: {
          move: {
            angle: {
              value: 135,
              offset: 0,
            },
            speed: 80,
          },
        },
      },
    ],
  };

  if (init) {
    return (
      <div
        style={{
          position: "fixed", // Keeps the component fixed in the viewport
          top: 0, // Position it at the top of the viewport
          left: 0, // Start from the left
          width: "100%", // Set full width
          height: "100%", // Set full height
          overflow: "hidden", // Prevent overflow from the confetti
          zIndex: 9999,
          pointerEvents: "none", // Disable interaction with this overlay
        }}
      >
        <Particles
          id={id}
          init={particlesLoaded}
          options={options}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    );
  }

  return null;
};

export default ParticlesComponent;
