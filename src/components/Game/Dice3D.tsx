import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Dice3DProps {
  value: number; // 1 to 6
  isRolling: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  disabled = false,
  onClick,
}) => {
  // Compute rotation angles for the dice face
  const rotation = useMemo(() => {
    switch (value) {
      case 1:
        return { x: 0, y: 0 };
      case 2:
        return { x: 0, y: -90 };
      case 3:
        return { x: 90, y: 0 };
      case 4:
        return { x: -90, y: 0 };
      case 5:
        return { x: 0, y: 90 };
      case 6:
        return { x: 0, y: 180 };
      default:
        return { x: 0, y: 0 };
    }
  }, [value]);

  return (
    <div
      onClick={!disabled && !isRolling ? onClick : undefined}
      className={`dice-scene mx-auto cursor-pointer transition-transform ${
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 active:scale-95'
      }`}
      title={disabled ? 'Waiting for turn...' : 'Click to roll!'}
    >
      <motion.div
        className="dice-cube"
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720, 1080, 1440 + rotation.x],
                rotateY: [0, 720, 1080, 1440, 1800 + rotation.y],
                scale: [1, 1.15, 0.95, 1.1, 1],
              }
            : {
                rotateX: rotation.x,
                rotateY: rotation.y,
                scale: 1,
              }
        }
        transition={
          isRolling
            ? { duration: 1.1, ease: [0.25, 1, 0.5, 1] }
            : { duration: 0.4, ease: 'easeOut' }
        }
      >
        {/* Face 1 */}
        <div className="dice-face dice-face-1 flex items-center justify-center">
          <span className="pip pip-pink w-4 h-4 scale-125" />
        </div>

        {/* Face 2 */}
        <div className="dice-face dice-face-2 grid grid-cols-2 grid-rows-2 p-3">
          <span className="pip justify-self-start self-start" />
          <span className="pip justify-self-end self-end col-start-2 row-start-2" />
        </div>

        {/* Face 3 */}
        <div className="dice-face dice-face-3 grid grid-cols-3 grid-rows-3 p-2.5">
          <span className="pip justify-self-start self-start col-start-1 row-start-1" />
          <span className="pip pip-pink justify-self-center self-center col-start-2 row-start-2" />
          <span className="pip justify-self-end self-end col-start-3 row-start-3" />
        </div>

        {/* Face 4 */}
        <div className="dice-face dice-face-4 grid grid-cols-2 grid-rows-2 p-3">
          <span className="pip justify-self-start self-start" />
          <span className="pip justify-self-end self-start" />
          <span className="pip justify-self-start self-end" />
          <span className="pip justify-self-end self-end" />
        </div>

        {/* Face 5 */}
        <div className="dice-face dice-face-5 grid grid-cols-3 grid-rows-3 p-2.5">
          <span className="pip justify-self-start self-start col-start-1 row-start-1" />
          <span className="pip justify-self-end self-start col-start-3 row-start-1" />
          <span className="pip pip-pink justify-self-center self-center col-start-2 row-start-2" />
          <span className="pip justify-self-start self-end col-start-1 row-start-3" />
          <span className="pip justify-self-end self-end col-start-3 row-start-3" />
        </div>

        {/* Face 6 */}
        <div className="dice-face dice-face-6 grid grid-cols-2 grid-rows-3 p-2.5">
          <span className="pip justify-self-start self-center" />
          <span className="pip justify-self-end self-center" />
          <span className="pip justify-self-start self-center" />
          <span className="pip justify-self-end self-center" />
          <span className="pip justify-self-start self-center" />
          <span className="pip justify-self-end self-center" />
        </div>
      </motion.div>
    </div>
  );
};
