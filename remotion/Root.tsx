import { Composition, staticFile } from "remotion";
import {
  MotionFlyer,
  type MotionFlyerFormat,
  type MotionPreset,
} from "./compositions/MotionFlyer";

type MotionFlyerInputProps = {
  imageUrl: string;
  audioUrl?: string;
  preset: MotionPreset;
  transitionVariant?: string;
  format?: MotionFlyerFormat;
  width?: number;
  height?: number;
  durationSeconds: number;
};

function getMotionDimensions(props: Partial<MotionFlyerInputProps>) {
  if (props.width && props.height) {
    return {
      width: props.width,
      height: props.height,
    };
  }

  switch (props.format) {
    case "SQUARE":
      return { width: 1024, height: 1024 };
    case "POST_FEED":
      return { width: 1024, height: 1280 };
    case "STORY":
    case "FLYER":
    default:
      return { width: 1024, height: 1536 };
  }
}

export function RemotionRoot() {
  return (
    <Composition
      id="MotionFlyer"
      component={MotionFlyer}
      fps={30}
      durationInFrames={300}
      width={1024}
      height={1536}
      defaultProps={{
        imageUrl: staticFile("examples/banner-01.webp"),
        audioUrl: staticFile("remotion-demo/demo.mp3"),
        preset: "CYBER_RAVE",
        transitionVariant: "VIRAL_SHAKE",
        format: "STORY",
        width: 1024,
        height: 1280,
        durationSeconds: 10,
      }}
      calculateMetadata={({ props }) => {
        const durationSeconds = Number(props.durationSeconds || 10);
        const dimensions = getMotionDimensions(props);

        return {
          ...dimensions,
          durationInFrames: Math.max(1, Math.round(durationSeconds * 30)),
          props,
        };
      }}
    />
  );
}
