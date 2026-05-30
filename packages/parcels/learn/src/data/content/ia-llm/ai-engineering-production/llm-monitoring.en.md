---
id: llm-monitoring
order: 16
difficulty: intermediate
tags: [LLM, monitoring, observability, OpenTelemetry, Prometheus]
publishedAt: 2099-12-31
updatedAt: 2026-05-30
---

Your dashboards are green, your CPU is quiet, and users still complain that the assistant has become slow, expensive, and weirdly evasive. That is the classic failure mode of LLM systems: infrastructure looks healthy while product quality drifts in plain sight.

Monitoring is where you stop looking at one request and start looking at the shape of the system over time. Logs explain one incident. Traces explain one path. Monitoring tells you whether today's traffic is getting costlier, slower, or less useful than yesterday's.

Most teams stop at latency and token count. That is not enough. I want a small set of metrics that reflect actual user pain: p95 end-to-end latency, cost per successful task, refusal rate, fallback rate, tool error rate, retrieval hit rate, and a quality proxy such as judge pass rate or human review score. If you only monitor speed, you miss the polite nonsense problem where the model answers quickly and badly.

The plumbing can stay boring. [OpenTelemetry metrics](https://opentelemetry.io/docs/concepts/signals/metrics/) gives you the right vocabulary, and [Prometheus histograms](https://prometheus.io/docs/practices/histograms/) are still a solid way to think about latency buckets and alerting. If you want an LLM-native view on top, [Langfuse](https://langfuse.com/docs) can help, but I still like keeping the primary alerts in the same monitoring stack as the rest of the product.

The hard part is picking metrics that lead to action. For example, total token usage is interesting for finance, but cost per successful task is what changes prioritization. A raw tool error count is noisy, but tool error rate by tool name tells you which dependency is poisoning the agent. Monitoring should create decisions, not decorative charts.

I also separate page-worthy alerts from trend reports. Rising cost by 5% might deserve a weekly review. Judge pass rate dropping 12% after a prompt change deserves a same-day rollback. If every metric pages, nobody trusts the pager.

I like writing the first alert rules before the product is fully polished, because it forces the team to define what "healthy" actually means.

```yaml
alerts:
  - name: llm-latency-p95
    query: p95(agent_request_latency_ms) > 12000
    action: page-oncall

  - name: llm-cost-per-task
    query: avg_over_time(agent_cost_per_success_usd[1h]) > 0.35
    action: notify-slack

  - name: llm-judge-pass-rate
    query: avg_over_time(agent_judge_pass_rate[30m]) < 0.82
    action: rollback-last-prompt

  - name: tool-error-rate
    query: rate(agent_tool_errors_total[15m]) / rate(agent_tool_calls_total[15m]) > 0.08
    action: page-owner
```

My rule: if you have not decided which metric should wake someone up and which metric should only trigger a review, you are not monitoring an LLM system yet, you are collecting souvenirs.
