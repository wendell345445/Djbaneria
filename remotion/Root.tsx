import { Composition, staticFile } from "remotion";
import { MotionFlyer } from "./compositions/MotionFlyer";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MotionFlyer"
        component={MotionFlyer}
        durationInFrames={300}
        fps={30}
        width={1024}
        height={1536}
        defaultProps={{
          imageUrl: staticFile("examples/banner-01.webp"),
          audioUrl: staticFile("remotion-demo/demo.mp3"),
          preset: "FESTIVAL_LIGHTS",
          durationSeconds: 10,
        }}
      />
    </>
  );
};
