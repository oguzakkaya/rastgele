"use client";

import { useHydrated } from "@/hooks/use-hydrated";
import { useOnline } from "@/hooks/use-online";
import { useChallengeFlow, type FlowOptions } from "@/hooks/use-challenge-flow";
import { ERROR_COPY } from "@/lib/copy";
import { getChallengeStorage } from "@/lib/storage/challenge-storage";
import { ExplainStage } from "./stages/explain-stage";
import { GeneratingStage } from "./stages/generating-stage";
import { ResearchStage } from "./stages/research-stage";
import {
  ErrorStage,
  EvaluatingStage,
  NotFoundStage,
  OfflineNotice,
  SkippedStage,
} from "./stages/status-stages";
import { TopicRevealStage } from "./stages/topic-reveal-stage";
import { TransitionStage } from "./stages/transition-stage";

/** The flow depends on local storage, so it only renders after hydration. */
export function ChallengeFlow({ options }: { options: FlowOptions }) {
  const hydrated = useHydrated();
  return hydrated ? <ChallengeFlowInner options={options} /> : <div className="flex-1" />;
}

function ChallengeFlowInner({ options }: { options: FlowOptions }) {
  const { state, actions } = useChallengeFlow(options);
  const online = useOnline();
  const completedResultId =
    state.status === "idle"
      ? getChallengeStorage()
          .getHistory()
          .find((r) => r.challenge.id === options.routeId)?.id
      : undefined;

  return (
    <div className="flex flex-1 flex-col" data-state={state.status}>
      {!online && <OfflineNotice />}
      <Stage state={state} actions={actions} completedResultId={completedResultId} />
    </div>
  );
}

type FlowHook = ReturnType<typeof useChallengeFlow>;

function Stage({ state, actions, completedResultId }: FlowHook & { completedResultId?: string }) {
  switch (state.status) {
    case "idle":
      return <NotFoundStage onNew={actions.generate} resultId={completedResultId} />;
    case "generating_topic":
      return <GeneratingStage />;
    case "topic_reveal":
      return (
        <TopicRevealStage
          key={state.challenge.id}
          challenge={state.challenge}
          briefReady={Boolean(state.brief)}
          onStart={actions.startResearch}
        />
      );
    case "researching":
      return (
        <ResearchStage
          challenge={state.challenge}
          brief={state.brief}
          startedAt={state.startedAt}
          onFinish={actions.finishResearch}
        />
      );
    case "transitioning":
      return <TransitionStage onDone={actions.transitionDone} />;
    case "explaining":
      return (
        <ExplainStage
          challenge={state.challenge}
          startedAt={state.startedAt}
          onExpire={actions.finishSpeaking}
        />
      );
    case "spoken":
      return (
        <ExplainStage
          challenge={state.challenge}
          startedAt={0}
          onExpire={() => {}}
        />
      );
    case "evaluating":
    case "result":
      return <EvaluatingStage topic={"challenge" in state ? state.challenge.topic : undefined} />;
    case "skipped":
      return <SkippedStage topic={state.challenge.topic} onNext={actions.generate} />;
    case "error":
      return state.kind === "topic" ? (
        <ErrorStage title={ERROR_COPY.topic.title} cta={ERROR_COPY.topic.cta} onRetry={actions.generate} />
      ) : (
        <ErrorStage
          title={ERROR_COPY.evaluation.title}
          cta={ERROR_COPY.evaluation.cta}
          onRetry={actions.retryEvaluation}
          secondary={{ label: "Anlatıma dön", onClick: actions.backToExplain }}
        />
      );
  }
}
