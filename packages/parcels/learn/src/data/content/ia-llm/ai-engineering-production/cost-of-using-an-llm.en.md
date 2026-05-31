---
id: cost-of-using-an-llm
order: 2
difficulty: beginner
tags: [production, tokens, llm]
publishedAt: 2026-05-31
updatedAt: 2026-05-31
---

You ship a small LLM feature, a few people try it, and the first awkward question lands immediately: are we about to spend pocket change or next month's coffee budget? Don't worry if this still feels abstract, it clicked for me once I stopped pricing “AI” in the abstract and priced one real request.

That is the move I recommend first every time. A monthly bill is just one request cost, repeated many times, with a few annoying extras layered on top.

To price one request, you need one new word: token. A token is a small chunk of text rather than a full word, and Anthropic's [token counting guide](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) is a clear place to see how providers count them. If you want the idea to stop feeling magical, the [OpenAI tokenizer](https://platform.openai.com/tokenizer) lets you paste text and watch it split into pieces.

Once tokens make sense, the next surprise is billing. Most APIs price input tokens, the text you send, separately from output tokens, the text the model generates back, and OpenAI's [pricing](https://developers.openai.com/api/docs/pricing) plus Anthropic's [pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) show why output is often the part that stings first. That is why I would shorten long answers before I touched anything else.

Here is the mental model I actually use. Request cost is input cost plus output cost. Monthly baseline is request cost multiplied by request count. Real monthly cost is baseline plus automatic retries, failed experiments, and the traffic spike nobody mentioned in the planning meeting.

Beginners usually underestimate that third line. A prompt that fails and gets sent again is not “just one more try”, it is another paid call. A huge system prompt sent on every request is not invisible plumbing, it is repeated spend. Both pricing pages also show discounted cached input for some models, meaning reused prompt prefixes can cost less, but I still would not depend on that to rescue a messy design. Shorter prompts and smaller answers are easier habits to trust.

So where should you start? I would start from a budget per active user, not from a favorite model. If one active user can only cost a few cents per day, you probably need shorter prompts, fewer retrieved documents, or a smaller model. If one response directly saves real time or revenue, you can afford a more capable model and a longer answer.

A simple first estimate works well enough. Take one short prompt, one average prompt, and one ugly worst case from your app. Count the input tokens, guess a realistic answer length, apply the provider prices, then multiply by expected daily traffic. Add a safety margin that feels slightly annoying. If the number still looks comfortable after that, you are probably in the right neighborhood.

My main caveat is simple. Do not compare models before you compare how the feature is actually used. A cheaper model with bloated prompts can lose to a better model with disciplined inputs. If your rough estimate is already higher than the value of the user action, cut context or output length first, then move on to the next guide about choosing a model.
