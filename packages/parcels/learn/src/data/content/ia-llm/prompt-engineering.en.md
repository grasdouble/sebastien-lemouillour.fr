## Few-shot prompting

Few-shot prompting consists of providing examples in the prompt to guide the model. The more representative the examples, the more precise the result.

```text
Translate from English to French:

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous ?"

English: "Thank you very much for your help."
French: "Merci beaucoup pour votre aide."

English: "I would like to book a table for two."
French:
```

## Chain-of-thought (CoT)

CoT asks the model to reason step by step before giving its final answer. This significantly improves performance on complex tasks.

```text
Solve this problem step by step:

If a train departs at 9:00 AM travelling at 75 mph, and another train departs
from the same station at 10:00 AM in the same direction at 90 mph, at what time
will the second train catch the first?

Reasoning:
```

## Role prompting

Assigning a role to the model improves the quality and consistency of responses in a specific domain.

- "You are a cybersecurity expert with 20 years of experience..."
- "You are a mathematics teacher explaining to high school students..."
- "You are a senior code reviewer looking for critical bugs..."
