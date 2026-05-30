---
id: llm-monitoring
order: 16
difficulty: intermediate
tags: [LLM, monitoring, observability, OpenTelemetry, Prometheus]
publishedAt: 2099-12-31
updatedAt: 2026-05-31
---

Your dashboards are green, the CPU is quiet, and users still say the assistant got slower, pricier, and somehow less helpful. I have been burned by that exact gap: infra looked fine while the product was drifting in plain sight.

That is why I start with product pain, not machine health. [OpenTelemetry metrics](https://opentelemetry.io/docs/concepts/signals/metrics/) gives you the base vocabulary for counters, gauges, and histograms, and the [GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) give you a useful starting point for LLM spans and metrics, with the important caveat that they are still marked Development, so I would not treat every name as frozen yet.

From there, I keep the first dashboard small: p95 end-to-end latency, cost per successful task, refusal rate, fallback rate, tool error rate by tool name, retrieval hit rate, and one quality proxy such as judge pass rate or human review score. If you only watch latency and token totals, you miss the polite nonsense problem where the model answers fast and wrong.

Latency is where teams usually make the first bad trade-off. [Prometheus histograms](https://prometheus.io/docs/practices/histograms/) are still the right mental model for aggregatable latency distributions, and Prometheus now recommends native histograms when your stack supports them. For the LLM-specific layer, I would add [Langfuse observability](https://langfuse.com/docs/observability/overview) for traces and [Langfuse evaluation](https://langfuse.com/docs/evaluation/overview) for online quality checks, but I would still keep paging alerts in the same monitoring stack as the rest of the product.

The trickier part is choosing metrics that force a decision. I do not alert on raw token count. I alert on cost per successful task, because that number changes model choice and prompt scope. I do not page on total tool failures either. I page on tool error rate by tool, because that tells me which dependency is poisoning the agent. If provider throttling is one of your common failures, add retry latency and fallback rate early or you will confuse rate-limit pain with model-quality regressions.

This is the starter rule set I would ship first. The thresholds below are placeholders, so tune them from your own baseline after a week or two of real traffic.

```yaml
alerts:
  - name: llm-latency-p95
    query: p95(agent_request_latency_ms) > 12000
    action: page-oncall
    # Page only when users are clearly waiting too long.

  - name: llm-cost-per-task
    query: avg_over_time(agent_cost_per_success_usd[1h]) > 0.35
    action: notify-slack
    # Review this weekly first, then tighten once pricing is stable.

  - name: llm-judge-pass-rate
    query: avg_over_time(agent_judge_pass_rate[30m]) < 0.82
    action: rollback-last-prompt
    # This catches quality drops that latency charts will never show.

  - name: tool-error-rate
    query: rate(agent_tool_errors_total[15m]) / rate(agent_tool_calls_total[15m]) > 0.08
    action: page-owner
    # Keep this split by tool name, not just one global error bucket.
```

My rule is simple: if a metric cannot trigger a page, a rollback, or a weekly cost decision, it does not belong in the first dashboard.
