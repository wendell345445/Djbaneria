import { Composition, staticFile } from "remotion";
import { MotionFlyer } from "./compositions/MotionFlyer";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="MotionFlyer"
        component={MotionFlyer}
        fps={30}
        width={1024}
        height={1536}
        durationInFrames={300}
        defaultProps={{
          imageUrl: staticFile("examples/banner-01.webp"),
          audioUrl: staticFile("remotion-demo/demo.mp3"),
          preset: "FESTIVAL_LIGHTS",
          transitionVariant: "AUTO",
          format: "STORY",
          durationSeconds: 10,
        }}
        calculateMetadata={({ props }) => {
          const durationSeconds = Number(props.durationSeconds) || 10;
          return {
            durationInFrames: Math.max(180, Math.min(450, Math.round(durationSeconds * 30))),
            fps: 30,
            width: 1024,
            height: props.format === "POST_FEED" ? 1280 : 1536,
          };
        }}
      />
    </>
  );
}
