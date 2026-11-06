(() => {
  "use strict";

  const tagSelector = [
    ".workflow-label-set > span",
    ".skill-category-tags span",
    ".project-tags span",
    ".course-tags span",
    ".evaluation-tags span",
    ".resume-meta-tags span",
    ".project-role-tags span",
    ".resume-entry-org span",
    ".work-kicker .work-entity",
    ".usecase-meta span"
  ].join(",");

  const modal = document.querySelector("#term-modal");
  const modalTitle = document.querySelector("#term-modal-title");
  const modalContext = document.querySelector("#term-modal-context");
  const modalDescription = document.querySelector("#term-modal-description");
  const modalClose = document.querySelector(".term-modal-close");
  const definitions = {};
  let activeTag = null;

  function normalize(value) {
    return value.trim().normalize("NFKC").toLowerCase().replace(/\s+/g, " ");
  }

  function define(key, en, zh) {
    definitions[normalize(key)] = { en, zh };
  }

  function language() {
    return document.documentElement.dataset.language === "zh" ? "zh" : "en";
  }

  function localized(element, fallback = "") {
    if (!element) return fallback;
    return element.dataset[language()] || element.textContent.trim() || fallback;
  }

  define("DATA", "The data layer turns raw sources into governed, versioned inputs for model development and evaluation.", "数据层将原始来源转化为可治理、可版本化的模型开发与评测输入。");
  define("MODEL", "The model layer studies architecture choices such as attention, routing, position encoding, and scaling behavior.", "模型层研究注意力、路由、位置编码与缩放规律等架构选择。");
  define("MODELS", "The model layer studies architecture choices such as attention, routing, position encoding, and scaling behavior.", "模型层研究注意力、路由、位置编码与缩放规律等架构选择。");
  define("TRAIN", "The training layer turns data and model choices into measurable capability through supervised, preference, and reinforcement optimization.", "训练层通过监督、偏好和强化学习优化，把数据与模型选择转化为可衡量的能力。");
  define("TRAINING", "The training layer turns data and model choices into measurable capability through supervised, preference, and reinforcement optimization.", "训练层通过监督、偏好和强化学习优化，把数据与模型选择转化为可衡量的能力。");
  define("INFERENCE", "The inference layer turns trained weights into tokens under latency, throughput, memory, and correctness constraints.", "推理层在延迟、吞吐、显存与正确性约束下，将训练后权重转化为生成结果。");
  define("HARNESS", "The harness layer lets an LLM plan, call tools, observe results, recover from failures, and complete real tasks.", "Harness 层让 LLM 能规划、调用工具、观察结果、从失败中恢复并完成真实任务。");
  define("EVAL", "The evaluation layer turns model behavior into comparable scores, failure evidence, and release decisions.", "评测层将模型行为转化为可比较的分数、失败证据与发布决策。");
  define("Recursive Self-Improvement", "A recursive self-improving system uses evaluation, feedback, and tooling to improve its own data, behavior, and engineering process over time.", "递归自我进化系统通过评测、反馈与工具持续改进自身的数据、行为和工程流程。");
  define("Algorithms × Systems", "The portfolio connects algorithmic quality with the systems needed to train, serve, evaluate, and operate it reliably.", "该主线把算法质量与训练、服务、评测和稳定运行所需的系统工程连接起来。");
  define("Verifiable Rewards", "Verifiable rewards use executable tests or deterministic checks instead of relying only on subjective model scores.", "可验证奖励使用可执行测试或确定性检查，而不是只依赖主观模型评分。");
  define("KV-Aware Serving", "KV-aware serving routes and schedules requests using cache locality, queue load, transfer cost, and available capacity.", "KV 感知服务依据缓存局部性、队列负载、传输成本和可用容量进行路由与调度。");
  define("Agent Harness", "An agent harness turns model outputs into controlled plans, tool calls, observations, recovery, and completed tasks.", "Agent Harness 将模型输出转化为受控规划、工具调用、观察、恢复和任务完成。");
  define("Production Evaluation", "Production evaluation connects offline benchmarks, online traces, regressions, and business outcomes into release decisions.", "生产级评测把离线基准、线上轨迹、回归与业务结果连接成发布决策。");
  define("Business × Agents", "This theme connects search, recommendation, advertising, support, data analysis, finance, healthcare, and coding workflows to Agent engineering.", "该主题将搜索、推荐、广告、客服、数据分析、金融、医疗与编程工作流连接到 Agent 工程。");
  define("End-to-End Ownership", "End-to-end ownership spans data, architecture, training, inference, harness, evaluation, and the business outcome.", "端到端负责覆盖数据、架构、训练、推理、执行框架、评测以及最终业务结果。");
  define("INPUT", "Inputs define the objects, constraints, and context entering a workflow stage.", "输入定义进入某一工作流阶段的对象、约束与上下文。");
  define("OUTPUT", "Outputs are the durable artifacts, decisions, or traces produced by a workflow stage.", "输出是工作流阶段产生的可复用产物、决策或轨迹。");
  define("COMPONENTS", "Components are reusable methods and system mechanisms used to implement a roadmap stage.", "组件是实现路线图阶段的可复用方法与系统机制。");
  define("METRICS", "Metrics make quality, efficiency, risk, and business outcomes observable and comparable.", "指标让质量、效率、风险与业务结果变得可观测、可比较。");
  define("TECHSTACK", "Tech Stack names concrete open-source tools and frameworks used to implement the upstream components.", "技术栈列出实现上游组件所用的具体开源工具与框架。");

  define("MHA", "Multi-Head Attention runs several attention heads in parallel so the model can represent different token relationships at once.", "多头注意力通过并行多个注意力头，让模型同时捕捉不同类型的 token 关系。");
  define("MQA", "Multi-Query Attention shares one key/value projection across query heads, reducing KV-cache size and memory bandwidth.", "多查询注意力让多个查询头共享一组 Key/Value，显著降低 KV Cache 容量和带宽压力。");
  define("GQA", "Grouped-Query Attention shares key/value projections within groups of query heads, balancing MHA quality and MQA efficiency.", "分组查询注意力让查询头分组共享 Key/Value，在 MHA 质量与 MQA 效率之间取得平衡。");
  define("MLA", "Multi-Head Latent Attention compresses key/value state into a latent representation to reduce KV-cache cost for long-context LLMs.", "多头潜在注意力将 Key/Value 状态压缩到潜在表示，降低长上下文 LLM 的 KV Cache 成本。");
  define("Sliding-window attention", "Sliding-window attention limits each token to a nearby context window, reducing long-sequence compute while preserving local dependencies.", "滑动窗口注意力只计算邻近窗口内的关系，在保留局部依赖的同时降低长序列计算量。");
  define("Sparse attention", "Sparse attention computes only selected token pairs instead of the full quadratic attention matrix, improving long-context efficiency.", "稀疏注意力只计算部分 token 对，避免完整的平方级注意力矩阵，提高长上下文效率。");
  define("MoE routing", "Mixture-of-Experts routing sends each token to a small subset of expert networks, increasing model capacity without activating every parameter.", "MoE 路由把每个 token 分配给少量专家网络，在不激活全部参数的情况下提升模型容量。");
  define("RoPE scaling", "RoPE scaling adapts rotary position embeddings so a model can extrapolate to context lengths beyond its original training window.", "RoPE 缩放调整旋转位置编码，使模型能够外推到超过原始训练窗口的上下文长度。");
  define("Scaling laws", "Scaling laws model how loss changes with parameters, data, and compute, guiding architecture and training-budget decisions.", "缩放定律描述损失随参数量、数据量与算力变化的规律，用于指导架构和训练预算决策。");
  define("Architecture search", "Architecture search compares model structures under explicit quality, latency, memory, and compute constraints.", "架构搜索在明确的质量、延迟、显存与算力约束下比较不同模型结构。");
  define("SFT", "Supervised Fine-Tuning trains a pretrained model on curated input-output demonstrations to acquire task format and behavior.", "监督微调使用高质量输入输出示例训练预训练模型，使其掌握任务格式与目标行为。");
  define("DPO", "Direct Preference Optimization learns from preferred versus rejected responses without a separate reward model or online RL loop.", "直接偏好优化利用“偏好回答 vs 拒绝回答”数据训练模型，无需独立奖励模型或在线强化学习循环。");
  define("RFT", "Rejection Fine-Tuning keeps high-quality or high-reward samples generated by a model and trains on those accepted trajectories.", "拒绝采样微调筛选模型生成的高质量或高奖励轨迹，并用这些被接受的样本继续训练。");
  define("RL", "Reinforcement Learning optimizes a policy through reward feedback, allowing behavior to improve beyond the available demonstrations.", "强化学习通过奖励反馈优化策略，使模型行为能够超越静态示范数据。");
  define("PPO", "Proximal Policy Optimization updates a policy while clipping large changes, improving training stability in reward-driven optimization.", "近端策略优化通过裁剪过大的策略更新来提升奖励优化的训练稳定性。");
  define("GRPO", "Group Relative Policy Optimization compares multiple responses to the same prompt and uses their relative rewards as the learning signal.", "组相对策略优化比较同一提示下的多个回答，并利用它们的相对奖励作为训练信号。");
  define("DAPO", "Decoupled Clip and Dynamic Sampling Policy Optimization is a PPO-family method designed for stable, high-throughput reasoning-model training.", "DAPO 是面向推理模型稳定、高效训练的 PPO 系列方法，采用解耦裁剪与动态采样。");
  define("OPD", "On-Policy Distillation trains a student on trajectories sampled from its own current policy, reducing train-inference distribution mismatch.", "在线策略蒸馏使用学生模型当前策略生成的轨迹进行训练，降低训练与推理之间的分布偏差。");
  define("OPSD", "On-Policy Self-Distillation trains on trajectories sampled from the current model and uses a denser self-distillation signal to improve reasoning within the on-policy distribution; exact teacher and filtering recipes vary by implementation.", "在线策略自蒸馏在当前模型自行采样的轨迹上训练，并利用更密集的自蒸馏信号改善同策略分布内的推理能力；具体教师信号与筛选方式会因实现而异。");
  define("MOPD", "Multi-Objective Preference Distillation balances multiple preference or reward objectives while distilling behavior into a student model; exact formulations vary by codebase.", "多目标偏好蒸馏在蒸馏学生模型时同时平衡多个偏好或奖励目标，具体实现会因代码库而异。");
  define("datatrove", "datatrove is Hugging Face's open-source toolkit for large-scale text extraction, filtering, deduplication, and LLM data processing.", "datatrove 是 Hugging Face 开源的大规模文本抽取、过滤、去重与 LLM 数据处理工具包。");
  define("Dolma Toolkit", "Dolma Toolkit is AI2's open-source pipeline for building reproducible, high-quality language-model pretraining corpora.", "Dolma Toolkit 是 AI2 开源的 LLM 预训练语料构建流水线，强调可复现的数据治理与质量控制。");
  define("NeMo Curator", "NeMo Curator is NVIDIA's GPU-accelerated open-source toolkit for deduplication, quality filtering, and synthetic data curation.", "NeMo Curator 是 NVIDIA 开源的 GPU 加速数据治理工具，支持去重、质量过滤与合成数据构建。");
  define("MinHash dedup", "MinHash estimates document similarity through compact signatures, making near-duplicate removal practical at web-scale.", "MinHash 使用紧凑签名估计文档相似度，使大规模近重复数据清理变得可行。");
  define("Contamination filter", "Contamination filtering removes training content that overlaps evaluation benchmarks so reported scores remain trustworthy.", "污染过滤会移除与评测基准重叠的训练内容，确保评测分数可信。");
  define("Synthetic data", "Synthetic data is model-generated or programmatically transformed training material used to cover rare cases, scale supervision, or improve diversity.", "合成数据是由模型生成或程序化转换的训练材料，用于覆盖长尾场景、扩展监督规模并提升多样性。");
  define("Mixture search", "Data-mixture search optimizes the proportions of domains or task types in a training corpus against validation objectives.", "数据配比搜索根据验证目标优化训练语料中不同领域或任务类型的比例。");
  define("Tokenizer-aware cleaning", "Tokenizer-aware cleaning measures text quality with the model's actual tokenizer, exposing fragments and coverage issues that character-level filters miss.", "分词感知清洗使用模型真实分词器衡量文本质量，能发现字符级过滤遗漏的碎片和覆盖问题。");
  define("Apache Arrow", "Apache Arrow is an open columnar in-memory format designed for efficient analytics and zero-copy data exchange.", "Apache Arrow 是开源列式内存格式，用于高效分析与零拷贝数据交换。");
  define("Parquet", "Parquet is an open columnar file format optimized for compressed storage and selective analytical reads.", "Parquet 是开源列式文件格式，针对压缩存储和选择性分析读取进行了优化。");
  define("Ray Data", "Ray Data is an open-source distributed data-processing layer for large-scale ML ingestion and transformation pipelines.", "Ray Data 是开源分布式数据处理层，适合大规模机器学习数据接入与转换流水线。");
  define("PyTorch", "PyTorch is an open-source tensor and deep-learning framework with dynamic computation graphs and a broad LLM ecosystem.", "PyTorch 是开源张量与深度学习框架，支持动态计算图，并拥有广泛的 LLM 生态。");
  define("JAX", "JAX combines NumPy-style APIs with automatic differentiation, JIT compilation, and hardware-aware parallelism.", "JAX 将 NumPy 风格接口与自动微分、JIT 编译和硬件并行能力结合起来。");
  define("FlashAttention", "FlashAttention is an IO-aware exact attention algorithm that reduces memory traffic for long sequences.", "FlashAttention 是 IO 感知的精确注意力算法，通过减少显存读写加速长序列计算。");
  define("FlashInfer", "FlashInfer is an open-source kernel library for high-performance LLM attention, sampling, and serving operations.", "FlashInfer 是面向高性能 LLM 注意力、采样与服务操作的开源内核库。");
  define("Transformer Engine", "Transformer Engine is NVIDIA's open-source library for optimized Transformer layers, mixed precision, and low-precision training.", "Transformer Engine 是 NVIDIA 开源库，用于优化 Transformer 层、混合精度与低精度训练。");
  define("torchtitan", "torchtitan is a PyTorch-native reference stack for large-scale LLM training using multi-dimensional parallelism.", "torchtitan 是 PyTorch 原生的大模型训练参考栈，展示多维并行等规模化训练能力。");
  define("DeepSpeed", "DeepSpeed is Microsoft's open-source library for distributed training, memory optimization, and very large model scaling.", "DeepSpeed 是微软开源的分布式训练与显存优化库，用于超大规模模型训练。");
  define("FSDP", "Fully Sharded Data Parallel shards parameters, gradients, and optimizer state across GPUs to reduce per-device memory.", "FSDP 将参数、梯度和优化器状态分片到多张 GPU，降低单卡显存占用。");
  define("Megatron-LM", "Megatron-LM is NVIDIA's open-source framework for large-scale Transformer training with tensor, pipeline, and data parallelism.", "Megatron-LM 是 NVIDIA 开源的大模型训练框架，支持张量并行、流水并行与数据并行。");
  define("verl", "verl is ByteDance's open-source RL library for training large language models with flexible rollout and reward pipelines.", "verl 是字节跳动开源的大语言模型强化学习框架，提供灵活的采样与奖励流水线。");
  define("TRL", "TRL is Hugging Face's open-source library for SFT, preference optimization, and reinforcement learning with language models.", "TRL 是 Hugging Face 开源的后训练库，支持 SFT、偏好优化和语言模型强化学习。");
  define("Unsloth", "Unsloth is an open-source fine-tuning library focused on memory-efficient, accelerated LLM adaptation.", "Unsloth 是开源微调库，重点优化 LLM 微调的显存占用与训练速度。");
  define("vLLM", "vLLM is an open-source high-throughput LLM inference engine built around efficient KV-cache management and serving.", "vLLM 是开源高吞吐 LLM 推理引擎，核心优势包括高效 KV Cache 与服务调度。");
  define("SGLang", "SGLang is an open-source structured-generation and LLM serving stack optimized for programmable prompting and caching.", "SGLang 是开源的结构化生成与 LLM 服务框架，面向可编程提示和高性能缓存优化。");
  define("TensorRT-LLM", "TensorRT-LLM is NVIDIA's open-source stack for optimized LLM kernels, compilation, and inference serving.", "TensorRT-LLM 是 NVIDIA 开源的 LLM 推理优化栈，覆盖内核、编译与部署服务。");
  define("llama.cpp", "llama.cpp is an open-source C/C++ inference engine optimized for local and edge LLM deployment.", "llama.cpp 是开源 C/C++ 推理引擎，适合本地与边缘设备的 LLM 部署。");
  define("LMDeploy", "LMDeploy is an open-source LLM compression and inference toolkit from the InternLM ecosystem.", "LMDeploy 是来自 InternLM 生态的开源 LLM 压缩与推理工具包。");
  define("PagedAttention", "PagedAttention stores KV cache in non-contiguous blocks, reducing fragmentation and enabling efficient request sharing.", "PagedAttention 将 KV Cache 分页存储在非连续块中，减少碎片并支持请求间共享。");
  define("Continuous batching", "Continuous batching inserts and removes requests between decoding steps so GPUs stay busy without waiting for a whole batch.", "连续批处理在解码步骤之间动态加入和移除请求，避免等待整批结束以保持 GPU 利用率。");
  define("Prefix caching", "Prefix caching reuses KV state for repeated prompt prefixes, reducing duplicate prefill computation.", "前缀缓存复用重复提示前缀的 KV 状态，减少重复 Prefill 计算。");
  define("Chunked prefill", "Chunked prefill splits long prompts into blocks so prefill work can interleave with decoding and improve latency consistency.", "分块预填充将长提示拆成多个块，使 Prefill 能与 Decode 交错，提高延迟稳定性。");
  define("Speculative decoding", "Speculative decoding uses a cheaper draft model or heads to propose tokens that the target model verifies in parallel.", "投机解码使用更轻量的草稿模型或头提出候选 token，再由目标模型并行验证。");
  define("Disaggregated P/D", "Disaggregated prefill/decode separates prompt processing from token generation so each stage can scale on specialized hardware.", "分离式预填充/解码将提示处理与 token 生成拆分，使两个阶段可以独立扩缩容。");
  define("ReAct loop", "The ReAct pattern alternates reasoning, tool actions, and observations until an agent can produce a grounded final answer.", "ReAct 循环交替执行推理、工具动作与观察，直到 Agent 给出有依据的最终结果。");
  define("Tool router", "A tool router chooses the safest relevant tool and validates its arguments before execution.", "工具路由器负责选择最合适、最安全的工具，并在执行前校验参数。");
  define("Context compaction", "Context compaction summarizes or prunes long histories so an agent keeps the information needed for the next action.", "上下文压缩会总结或裁剪长历史，使 Agent 保留下一步行动所需的信息。");
  define("Sandbox executor", "A sandbox executor runs generated code or tool calls in an isolated environment with resource and permission limits.", "沙箱执行器在隔离环境中运行生成代码或工具调用，并限制资源与权限。");
  define("Subagent orchestration", "Subagent orchestration decomposes work across specialized agents while managing dependencies, context, and results.", "子 Agent 编排将任务拆分给专门 Agent，同时管理依赖、上下文与结果汇总。");
  define("Recovery controller", "A recovery controller detects failed actions and decides whether to retry, repair context, switch tools, or escalate.", "恢复控制器检测失败动作，并决定重试、修复上下文、切换工具或升级处理。");
  define("Codex", "Codex is OpenAI's coding-agent product; its CLI is an open-source interface for repository-aware code changes and execution.", "Codex 是 OpenAI 的编程 Agent 产品，其 CLI 以开源方式提供仓库级代码修改与执行能力。");
  define("Claude Code", "Claude Code is Anthropic's terminal-based coding agent for repository navigation, editing, and command execution; it is not open source.", "Claude Code 是 Anthropic 的终端编程 Agent，可浏览仓库、编辑代码并执行命令；它不是开源项目。");
  define("Claude Agent SDK", "Claude Agent SDK is Anthropic's toolkit for building agents with Claude, including tool use, context management, and execution loops.", "Claude Agent SDK 是 Anthropic 提供的 Agent 开发工具包，用于构建带工具调用、上下文管理与执行循环的 Claude Agent。");
  define("DeepSeek Harness", "DeepSeek Harness is included as a DeepSeek-oriented agent execution harness reference; verify the current upstream repository for supported features and licensing.", "DeepSeek Harness 是面向 DeepSeek 的 Agent 执行框架参考；具体能力与许可证应以当前上游仓库为准。");
  define("Pi", "Pi is Earendil Works' open-source agent project for building and running LLM-powered workflows; consult its repository for current capabilities.", "Pi 是 Earendil Works 的开源 Agent 项目，用于构建和运行 LLM 工作流；具体能力以仓库文档为准。");
  define("LangGraph", "LangGraph is an open-source framework for stateful, graph-based agent orchestration with persistence and human-in-the-loop controls.", "LangGraph 是开源的有状态图式 Agent 编排框架，支持持久化与人工介入。");
  define("OpenHands", "OpenHands is an open-source platform for software-engineering agents that can edit code, run commands, and browse.", "OpenHands 是开源软件工程 Agent 平台，可以编辑代码、运行命令并浏览网页。");
  define("OpenCode", "OpenCode is an open-source terminal coding agent focused on repository-aware development workflows.", "OpenCode 是开源终端编程 Agent，面向仓库级开发工作流。");
  define("E2B", "E2B is an open-source SDK and infrastructure for running AI-generated code inside isolated cloud sandboxes.", "E2B 是用于在隔离云沙箱中运行 AI 生成代码的开源 SDK 与基础设施。");
  define("SWE-agent", "SWE-agent is an open-source research framework for LLM agents that resolve software-engineering tasks in repositories.", "SWE-agent 是开源研究框架，让 LLM Agent 在代码仓库中完成软件工程任务。");
  define("OpenAI Agents SDK", "OpenAI Agents SDK is an open-source framework for tool calling, handoffs, tracing, and multi-agent orchestration.", "OpenAI Agents SDK 是开源 Agent 框架，支持工具调用、任务交接、追踪与多 Agent 编排。");
  define("MCP", "Model Context Protocol is an open protocol for exposing tools, resources, and prompts to LLM applications through a common interface.", "MCP 是开放协议，通过统一接口向 LLM 应用提供工具、资源与提示。");
  define("LLM-as-judge", "LLM-as-judge uses a model to score outputs against explicit rubrics, trading human cost for calibration and bias risks.", "LLM 评审使用模型按明确量表给输出打分，可降低人工成本，但需要控制偏差与校准问题。");
  define("Rubric grading", "Rubric grading converts subjective quality criteria into observable, weighted scoring rules.", "量表评分把主观质量标准转化为可观察、可加权计算的评分规则。");
  define("Trajectory evaluation", "Trajectory evaluation scores the sequence of decisions, tool calls, and observations that led to an agent outcome, not only the final answer.", "轨迹评测不仅看最终答案，也评估 Agent 在过程中做出的决策、工具调用与观察。");
  define("Regression slicing", "Regression slicing breaks evaluation results into targeted cohorts to reveal failures hidden by aggregate averages.", "回归切片按特定群体或场景拆分评测结果，找出被总体平均分掩盖的失败。");
  define("Contamination checks", "Contamination checks detect benchmark leakage into training data and flag scores that may be inflated.", "污染检查用于发现训练数据中的评测泄漏，并标记可能虚高的分数。");
  define("Cost / latency eval", "Cost and latency evaluation measures whether quality gains are economically and operationally viable in production.", "成本与延迟评测判断质量收益在生产环境中是否具备经济和运行可行性。");
  define("Inspect", "Inspect is an open-source framework from the UK AI Security Institute for reproducible LLM evaluations and agent traces.", "Inspect 是英国 AI Security Institute 开源的 LLM 评测框架，支持可复现评测与 Agent 轨迹分析。");
  define("lm-evaluation-harness", "lm-evaluation-harness is EleutherAI's open-source framework for standardized language-model benchmarks and few-shot evaluation.", "lm-evaluation-harness 是 EleutherAI 开源的语言模型标准化基准与 few-shot 评测框架。");
  define("HELM", "HELM is Stanford's open evaluation framework for comparing language models across accuracy, robustness, fairness, and efficiency.", "HELM 是斯坦福开源的语言模型评测框架，从准确率、鲁棒性、公平性与效率等维度进行比较。");
  define("Promptfoo", "Promptfoo is an open-source tool for prompt regression tests, side-by-side model comparisons, and guardrail evaluation.", "Promptfoo 是开源工具，用于提示回归测试、模型对比与安全护栏评测。");
  define("DeepEval", "DeepEval is an open-source LLM evaluation framework with unit-style tests for RAG, agents, safety, and response quality.", "DeepEval 是开源 LLM 评测框架，以单元测试方式覆盖 RAG、Agent、安全与回答质量。");
  define("EvalScope", "EvalScope is an open-source LLM and multimodal evaluation framework from the ModelScope ecosystem.", "EvalScope 是 ModelScope 生态中的开源大模型与多模态评测框架。");
  define("RLVR", "Reinforcement Learning with Verifiable Rewards trains on outcomes checked by executable or deterministic verifiers.", "可验证奖励强化学习使用可执行或确定性验证器检查结果，并据此训练模型。");
  define("Cocotb", "Cocotb is an open-source coroutine-based verification framework that lets Python drive hardware simulators.", "Cocotb 是开源协程式验证框架，可用 Python 驱动硬件仿真器。");
  define("UVM", "Universal Verification Methodology is a standardized SystemVerilog framework for building reusable hardware verification environments.", "UVM 是标准化的 SystemVerilog 验证方法学，用于构建可复用的硬件验证环境。");
  define("NCCL", "NVIDIA Collective Communications Library provides optimized multi-GPU and multi-node collective communication.", "NCCL 是 NVIDIA 的多 GPU、多节点集合通信库，为分布式训练与推理提供高性能通信。");
  define("KV Cache", "KV Cache stores past key/value states during autoregressive decoding to avoid recomputing the full context for every token.", "KV Cache 在自回归解码中保存历史 Key/Value 状态，避免每个 token 都重算完整上下文。");
  define("KV Routing", "KV-aware routing sends requests to workers according to cache locality, queue load, and transfer cost.", "KV 感知路由根据缓存局部性、队列负载与传输成本选择请求执行节点。");
  define("NDCG", "Normalized Discounted Cumulative Gain evaluates ranking quality by rewarding relevant results that appear near the top.", "NDCG 通过奖励排名靠前的相关结果来评价排序质量。");
  define("CTR", "Click-through rate is the fraction of impressions that receive clicks, often used as an online engagement signal.", "点击率是获得点击的曝光占比，常用于衡量线上内容或广告的吸引力。");
  define("CVR", "Conversion rate is the fraction of users or sessions that complete a target action such as purchase or registration.", "转化率是完成购买、注册等目标行为的用户或会话占比。");
  define("GMV", "Gross merchandise value measures total transaction value flowing through a commerce platform before deductions.", "GMV 表示电商平台在扣除前产生的交易总额，是常见业务规模指标。");
  define("CPA", "Cost per acquisition measures the advertising spend required to acquire one conversion or customer.", "CPA 衡量获得一次转化或一个客户所需的广告成本。");
  define("CSAT", "Customer satisfaction score measures how satisfied users are with a support interaction or product experience.", "CSAT 衡量用户对客服交互或产品体验的满意程度。");
  define("Data pipeline", "A data pipeline ingests, validates, transforms, versions, and publishes data for downstream training and evaluation.", "数据流水线负责接入、校验、转换、版本化并发布训练与评测所需数据。");
  define("Data governance", "Data governance defines ownership, quality gates, privacy rules, lineage, and lifecycle controls for training data.", "数据治理定义训练数据的权属、质量门禁、隐私规则、血缘与生命周期控制。");
  define("Spark", "Apache Spark is an open-source distributed engine for large-scale batch and stream data processing.", "Apache Spark 是开源分布式数据处理引擎，支持大规模批处理与流处理。");
  define("Flink", "Apache Flink is an open-source stateful stream-processing engine used for real-time and event-driven data pipelines.", "Apache Flink 是开源有状态流处理引擎，适合实时与事件驱动的数据流水线。");
  define("Kafka", "Apache Kafka is an open-source distributed event-streaming platform for durable, high-throughput data movement.", "Apache Kafka 是开源分布式事件流平台，用于高吞吐、持久化的数据传输。");
  define("Iceberg", "Apache Iceberg is an open table format for large analytical datasets with schema evolution and snapshot isolation.", "Apache Iceberg 是面向大规模分析数据的开放表格式，支持模式演进与快照隔离。");
  define("Long context", "Long-context modeling extends the effective input window while controlling attention cost, memory use, and retrieval quality.", "长上下文建模在控制注意力成本、显存占用与检索质量的同时扩展有效输入窗口。");
  define("Training Infrastructure", "Training infrastructure coordinates distributed compute, data loading, communication, checkpointing, failure recovery, and experiment observability.", "训练基础设施协调分布式算力、数据加载、通信、检查点、故障恢复与实验可观测性。");
  define("Reward Modeling", "Reward modeling learns a scoring function from preferences or verifiable outcomes to guide post-training and evaluation.", "奖励建模从偏好或可验证结果中学习评分函数，用于指导后训练与评测。");
  define("Slurm", "Slurm is an open-source workload manager for scheduling and managing jobs on GPU and CPU clusters.", "Slurm 是开源集群作业调度系统，用于管理 GPU 与 CPU 计算任务。");
  define("Inference Infrastructure", "Inference infrastructure turns trained models into reliable services under latency, throughput, memory, availability, and cost constraints.", "推理基础设施在延迟、吞吐、显存、可用性与成本约束下把训练模型转化为可靠服务。");
  define("GPU Optimization", "GPU optimization improves kernel efficiency, memory access, parallelism, batching, and hardware utilization for model workloads.", "GPU 优化通过内核效率、访存、并行、批处理与硬件利用率提升模型负载性能。");
  define("Quantization", "Quantization reduces weight or activation precision to lower memory and bandwidth cost while controlling quality loss.", "量化通过降低权重或激活精度减少显存和带宽成本，同时控制质量损失。");
  define("CUDA", "CUDA is NVIDIA's parallel-computing platform and programming model for GPU kernels and accelerated libraries.", "CUDA 是 NVIDIA 的 GPU 并行计算平台与编程模型，用于编写内核和调用加速库。");
  define("Triton", "Triton is an open-source language and compiler for writing efficient GPU kernels with Python-like syntax.", "Triton 是开源 GPU 内核开发语言与编译器，以接近 Python 的方式编写高性能内核。");
  define("Agent Infrastructure", "Agent infrastructure provides the execution, memory, tool, permission, observability, and recovery services around an LLM agent.", "Agent 基础设施为 LLM Agent 提供执行、记忆、工具、权限、可观测与恢复服务。");
  define("Memory system", "An agent memory system stores and retrieves durable task knowledge beyond the current prompt window.", "Agent 记忆系统用于在上下文窗口之外存储并检索持久任务知识。");
  define("Context Engineering", "Context engineering selects, compresses, orders, and refreshes the information an agent sees before each decision.", "上下文工程负责选择、压缩、排序并刷新 Agent 在每次决策前看到的信息。");
  define("Model Evaluation", "Model evaluation turns model behavior into comparable quality, safety, robustness, latency, and cost evidence.", "模型评测把模型行为转化为可比较的质量、安全、鲁棒性、延迟与成本证据。");
  define("Online Evaluation", "Online evaluation measures model behavior on real traffic through controlled launches and production telemetry.", "在线评测通过受控发布和生产遥测衡量真实流量下的模型表现。");
  define("A/B Testing", "A/B testing compares variants through randomized or controlled traffic allocation to estimate causal product impact.", "A/B 测试通过随机或受控流量分配比较不同方案，从而估计真实的业务因果影响。");
  define("Red Teaming", "Red teaming probes a model or agent with adversarial inputs to expose unsafe, brittle, or policy-violating behavior.", "红队测试使用对抗输入探测模型或 Agent 的不安全、脆弱与违规行为。");
  define("Multi-modal Data", "Multimodal data combines text, images, audio, video, or structured signals into a training and evaluation pipeline.", "多模态数据将文本、图像、音频、视频或结构化信号组合进训练与评测流水线。");
  define("Quality & Diversity", "Quality and diversity jointly measure whether data is trustworthy and whether it covers the behaviors and long-tail cases a model needs.", "质量与多样性共同衡量数据是否可信，以及是否覆盖模型所需的行为与长尾场景。");
  define("Continued Pre-training", "Continued pre-training adapts a base model to new domains or distributions before supervised or preference optimization.", "继续预训练在监督微调或偏好优化之前，让基座模型适应新领域或数据分布。");
  define("Multimodal", "Multimodal modeling aligns information across text, images, audio, video, and structured inputs.", "多模态建模对齐文本、图像、音频、视频与结构化输入中的信息。");
  define("Multi-turn reasoning", "Multi-turn reasoning maintains task state and resolves dependencies across several dialogue or tool-use rounds.", "多轮推理在多轮对话或工具使用中维持任务状态并解决前后依赖。");
  define("Preference Alignment", "Preference alignment adjusts model behavior toward human, policy, or task-specific preferences while limiting regressions.", "偏好对齐让模型行为更符合人类、政策或任务偏好，同时控制能力回退。");
  define("Multi-tenant Training", "Multi-tenant training shares large clusters across teams or jobs while enforcing isolation, fairness, scheduling, and resource efficiency.", "多租户训练让多个团队或任务共享大规模集群，同时处理隔离、公平调度与资源效率。");
  define("Heterogeneous Hardware", "Heterogeneous hardware combines different accelerators, memory hierarchies, and interconnects under one serving or training system.", "异构硬件在同一训练或推理系统中组合不同加速器、显存层级与互连。");
  define("Compilation Optimization", "Compilation optimization fuses, schedules, and lowers model operators for the target accelerator to improve latency and throughput.", "编译优化针对目标加速器融合、调度并 lowering 模型算子，以改善延迟与吞吐。");
  define("Traffic Scheduling", "Traffic scheduling routes and queues requests across workers according to load, locality, capacity, and service constraints.", "流量调度根据负载、局部性、容量与服务约束在多个工作节点间分配和排队请求。");
  define("Tool Use", "Tool use lets an agent call external functions, retrieve data, execute code, and incorporate observations into later decisions.", "工具调用让 Agent 调用外部函数、检索数据、执行代码，并将观察结果用于后续决策。");
  define("AI Search", "AI search combines retrieval, query understanding, ranking, and generation to produce grounded answers rather than only links.", "AI 搜索结合检索、查询理解、排序与生成，提供有依据的回答而不只是返回链接。");
  define("Automated Evaluation", "Automated evaluation runs repeatable scoring pipelines over model or agent behavior with minimal manual intervention.", "自动化评测以尽量少的人工介入，对模型或 Agent 行为运行可重复的评分流水线。");
  define("Evaluation Set Construction", "Evaluation-set construction designs representative, difficult, contamination-controlled cases that measure the capabilities teams care about.", "评测集建设设计具有代表性、难度与防污染控制的案例，用于衡量团队真正关心的能力。");
  define("Safety Evaluation", "Safety evaluation tests harmful, adversarial, policy-sensitive, and failure-prone behavior before or after release.", "安全评测在发布前后测试有害、对抗、政策敏感与易失败行为。");
  define("Kubernetes", "Kubernetes is an open-source container orchestration platform for scheduling, scaling, and operating distributed workloads.", "Kubernetes 是开源容器编排平台，用于调度、扩缩容与运维分布式工作负载。");
  define("E-commerce", "E-commerce is the online buying and selling of goods or services, spanning discovery, conversion, fulfillment, and customer service.", "电商是在线购买与销售商品或服务，覆盖发现、成交、履约与客户服务。");
  define("Content platform", "A content platform distributes articles, video, audio, or creator media and optimizes discovery, engagement, and monetization.", "内容平台分发文章、视频、音频或创作者媒体，并优化发现、互动与商业化。");
  define("Social platform", "A social platform connects users through feeds, messaging, communities, and creator ecosystems.", "社交平台通过信息流、消息、社区和创作者生态连接用户。");
  define("Developer platform", "A developer platform provides APIs, tools, workflows, and infrastructure for building and operating software.", "开发者平台提供用于构建与运维软件的 API、工具、工作流和基础设施。");
  define("Enterprise tools", "Enterprise tools support internal workflows such as data analysis, operations, productivity, and decision-making.", "企业工具支持数据分析、运营、生产力与决策等内部工作流。");
  define("Financial markets", "Financial markets are venues and systems for trading securities, derivatives, currencies, and other financial instruments.", "金融市场是交易证券、衍生品、外汇及其他金融工具的场所与系统。");
  define("Brokerage", "Brokerage provides order routing, execution, custody, and account services between investors and markets.", "券商业务为投资者与市场之间提供订单路由、执行、托管和账户服务。");
  define("Risk operations", "Risk operations monitors exposure, policy limits, fraud, and abnormal events and coordinates mitigation.", "风控运营监控敞口、限额、欺诈与异常事件，并协调处置。");
  define("Healthcare", "Healthcare covers prevention, diagnosis, treatment, care delivery, and health-system operations.", "医疗健康覆盖预防、诊断、治疗、护理与医疗系统运营。");
  define("Telemedicine", "Telemedicine delivers remote consultation, triage, follow-up, and care coordination through digital channels.", "互联网医疗通过数字渠道提供远程问诊、分诊、随访与护理协同。");
  define("Insurance", "Insurance transfers financial risk through underwriting, claims, pricing, and coverage operations.", "保险通过承保、理赔、定价与保障运营转移财务风险。");
  define("Brand safety", "Brand safety prevents advertising or generated content from appearing beside or expressing unsuitable material.", "品牌安全避免广告或生成内容出现在不当环境，或表达不适合品牌的含义。");
  define("Compliance", "Compliance verifies that products, data use, and automated actions satisfy legal, regulatory, and internal policy requirements.", "合规检查产品、数据使用与自动动作是否满足法律、监管及内部政策要求。");
  define("Containment", "Containment is the share of support demand resolved without escalation or human intervention.", "自助解决率是无需升级或人工介入即可解决的客服需求占比。");
  define("Diversity", "Diversity measures how broadly recommendations, content, or actions cover relevant sources and perspectives.", "多样性衡量推荐、内容或动作对相关来源与视角的覆盖广度。");
  define("Escalation accuracy", "Escalation accuracy measures whether cases that require a human are escalated correctly and timely.", "升级准确率衡量需要人工处理的案例是否被正确、及时地升级。");
  define("Escalation correctness", "Escalation correctness evaluates whether a medical or support case is routed to the right level of human care.", "升级处置正确性评估医疗或客服案例是否被转交给正确层级的人工处理。");
  define("Execution accuracy", "Execution accuracy checks whether generated SQL or analysis code runs and returns the intended result.", "执行准确率检查生成的 SQL 或分析代码能否正确运行并返回预期结果。");
  define("Answer validity", "Answer validity evaluates whether an analysis result is logically supported by the data and assumptions.", "答案有效性评估分析结论是否被数据与假设合理支持。");
  define("Permission violations", "Permission violations count attempts to access data or actions outside the user's authorized scope.", "权限违规统计超出用户授权范围的数据访问或动作尝试。");
  define("Policy violations", "Policy violations count results that break product, safety, legal, or business rules.", "政策违规统计违反产品、安全、法律或业务规则的结果。");
  define("Recall@K", "Recall@K measures how many relevant items are retrieved within the first K candidates.", "Recall@K 衡量前 K 个候选中召回了多少相关条目。");
  define("Retention", "Retention measures whether users return and continue using a product over time.", "留存衡量用户是否在一段时间后继续返回并使用产品。");
  define("Safety", "Safety measures whether a system avoids harmful, unauthorized, or high-risk behavior.", "安全性衡量系统是否避免有害、越权或高风险行为。");
  define("Sharpe", "The Sharpe ratio measures excess return relative to volatility, commonly used to compare risk-adjusted trading performance.", "夏普比率衡量超额收益相对于波动的表现，常用于比较风险调整后的交易结果。");
  define("Slippage", "Slippage is the difference between expected and executed trading prices.", "滑点是预期成交价格与实际成交价格之间的差异。");
  define("Max drawdown", "Maximum drawdown measures the largest peak-to-trough loss in portfolio value.", "最大回撤衡量投资组合从峰值到谷值的最大损失。");
  define("Triage accuracy", "Triage accuracy measures whether a medical agent assigns the correct urgency and care pathway.", "分诊准确率衡量医疗 Agent 是否给出正确的紧急程度与就医路径。");
  define("Hallucination rate", "Hallucination rate measures the share of unsupported or fabricated claims in model output.", "幻觉率衡量模型输出中缺乏依据或虚构内容的比例。");
  define("Handle time", "Handle time measures the elapsed time needed to resolve or advance a support case.", "处理时长衡量解决或推进一个客服案例所需的时间。");
  define("Zero-result rate", "Zero-result rate is the fraction of searches that return no useful result.", "无结果率是没有返回有效结果的搜索占比。");
  define("Pass rate", "Pass rate is the fraction of evaluation cases that satisfy the required criteria.", "通过率是满足规定判定标准的评测案例占比。");
  define("Acceptance", "Acceptance measures how often generated code or suggestions are accepted by developers.", "采纳率衡量开发者接受生成代码或建议的比例。");
  define("Merge rate", "Merge rate measures how often generated code changes survive review and are merged.", "合并率衡量生成代码经过评审并最终被合并的比例。");
  define("Regressions", "Regressions are previously working behaviors that become worse after a model, data, or system change.", "回归是模型、数据或系统变更后，原本正常的能力出现退化。");
  define("Raw corpora", "Raw corpora are the original text, code, audio, image, or video collections before cleaning and quality controls.", "原始语料是经过清洗和质量控制之前的文本、代码、音频、图像或视频集合。");
  define("Schemas", "Schemas define the required fields, types, relationships, and validation rules for structured data.", "数据结构定义结构化数据的字段、类型、关系与校验规则。");
  define("Metadata", "Metadata describes the origin, ownership, version, sensitivity, and quality attributes of a data asset.", "元数据描述数据资产的来源、归属、版本、敏感性与质量属性。");
  define("Source weights", "Source weights control how much each corpus, domain, or data source contributes to training.", "来源权重控制不同语料、领域或数据源对训练的贡献比例。");
  define("PII policy", "A PII policy defines how personal or sensitive information is detected, masked, retained, and audited.", "隐私策略定义个人或敏感信息如何检测、脱敏、保留与审计。");
  define("Versioned datasets", "Versioned datasets make every training and evaluation input reproducible and traceable.", "版本化数据集让每次训练与评测输入都可复现、可追溯。");
  define("Splits", "Splits separate data into training, validation, test, and evaluation partitions.", "数据切分将数据划分为训练、验证、测试和评测集合。");
  define("Data cards", "Data cards document dataset purpose, composition, provenance, limitations, and recommended use.", "数据卡记录数据集目的、构成、来源、局限与推荐用途。");
  define("Dedup index", "A dedup index stores signatures or hashes that identify duplicate and near-duplicate records.", "去重索引存储用于识别重复与近重复记录的特征或哈希。");
  define("Quality report", "A quality report summarizes validation failures, coverage, duplication, and other dataset risks.", "质量报告汇总校验失败、覆盖、重复与其他数据风险。");
  define("Coverage", "Coverage measures how broadly a dataset represents the required domains, tasks, languages, and edge cases.", "覆盖率衡量数据集对所需领域、任务、语言与边界场景的代表广度。");
  define("Dedup rate", "Dedup rate is the share of records removed or flagged as duplicates.", "去重率是被移除或标记为重复的数据占比。");
  define("Label agreement", "Label agreement measures consistency among annotators or between annotation and reference labels.", "标注一致性衡量标注员之间或标注与参考标签之间的一致程度。");
  define("Leakage", "Leakage occurs when evaluation or future information improperly enters training data.", "数据泄漏指评测信息或未来信息不当进入训练数据。");
  define("Freshness", "Freshness measures whether data reflects the current environment, behavior, or knowledge.", "新鲜度衡量数据是否反映当前环境、行为或知识。");
  define("Task constraints", "Task constraints define the requirements the model architecture must satisfy, such as quality, latency, and deployment limits.", "任务约束定义模型架构必须满足的质量、延迟和部署限制。");
  define("Token budget", "Token budget specifies the maximum token volume available for training, inference, or retrieved context.", "Token 预算限定训练、推理或上下文检索可使用的最大 Token 数量。");
  define("Compute envelope", "The compute envelope defines the available hardware, cost, memory, and time limits for model research.", "算力边界定义模型研究可用的硬件、成本、显存与时间限制。");
  define("Quality targets", "Quality targets translate business or product requirements into measurable model outcomes.", "质量目标把业务或产品需求转化为可衡量的模型结果。");
  define("Latency budget", "Latency budget allocates the maximum acceptable delay across each component of a request path.", "延迟预算为请求链路中的各组件分配最大可接受时延。");
  define("Candidate architectures", "Candidate architectures are alternative model designs evaluated under the same constraints.", "候选架构是在相同约束下评估的多种模型设计方案。");
  define("Ablation results", "Ablation results show how removing or changing a component affects model quality and efficiency.", "消融结果展示移除或修改某个组件后对模型质量与效率的影响。");
  define("Scaling curves", "Scaling curves plot quality against parameters, data, compute, or context length.", "缩放曲线展示质量随参数量、数据、算力或上下文长度变化的趋势。");
  define("Architecture specs", "Architecture specs define layers, attention type, width, depth, tokenization, and other structural choices.", "架构规格定义层结构、注意力类型、宽度、深度、分词方式等结构选择。");
  define("Cost curve", "A cost curve relates capability or traffic to training, inference, and infrastructure cost.", "成本曲线描述能力或流量与训练、推理和基础设施成本之间的关系。");
  define("Quality", "Quality measures how well model output satisfies correctness, usefulness, and expected behavior.", "质量衡量模型输出在正确性、有用性与预期行为上的满足程度。");
  define("Compute efficiency", "Compute efficiency measures useful quality or throughput obtained per unit of accelerator compute.", "计算效率衡量单位加速器算力获得的有效质量或吞吐。");
  define("Scaling slope", "Scaling slope describes how quickly loss or capability changes as model and data scale increase.", "缩放斜率描述损失或能力随模型与数据规模增长的改善速度。");
  define("Memory footprint", "Memory footprint is the GPU or host memory required by model weights, activations, optimizer state, and caches.", "显存占用是模型权重、激活、优化器状态与缓存所需的 GPU 或主机内存。");
  define("Latency", "Latency measures the time between a request or event and the corresponding system response.", "延迟衡量请求或事件到系统响应之间的时间。");
  define("Data mixtures", "Data mixtures define the sampling proportions across domains, tasks, languages, and source qualities.", "数据配比定义跨领域、任务、语言与数据质量的采样比例。");
  define("Objectives", "Training objectives define the loss or reward signal a model is optimized to satisfy.", "目标函数定义模型训练时要优化的损失或奖励信号。");
  define("Hardware budgets", "Hardware budgets constrain the number and type of accelerators available for a training run.", "算力预算限制一次训练可用的加速器数量与类型。");
  define("Curriculum", "A curriculum orders training data from easier or cleaner examples to harder or more diverse cases.", "课程设计按照由易到难、由干净到多样的顺序组织训练数据。");
  define("Eval checkpoints", "Evaluation checkpoints define when validation and regression tests run during training.", "评测节点定义训练过程中何时执行验证与回归测试。");
  define("Checkpoints", "Checkpoints persist model, optimizer, and scheduler state so training can resume or deploy a selected iteration.", "检查点保存模型、优化器与调度器状态，用于恢复训练或部署指定迭代。");
  define("Training logs", "Training logs record loss, throughput, gradients, hardware health, and other run-level signals.", "训练日志记录损失、吞吐、梯度、硬件健康等运行信号。");
  define("Reproducible configs", "Reproducible configs capture code, data, hyperparameters, environment, and seeds needed to repeat a run.", "可复现配置保存重复实验所需的代码、数据、超参数、环境与随机种子。");
  define("Model deltas", "Model deltas describe the differences introduced by a training run relative to a base checkpoint.", "模型增量描述一次训练相对基座检查点引入的变化。");
  define("Run reports", "Run reports summarize experiment setup, metrics, failures, and conclusions for a training run.", "运行报告汇总训练实验的设置、指标、失败与结论。");
  define("Loss", "Loss is the optimization objective minimized during model training.", "损失是模型训练过程中被最小化的优化目标。");
  define("Throughput", "Throughput measures how many requests, tokens, samples, or training steps are processed per unit time.", "吞吐衡量单位时间内处理的请求、Token、样本或训练步数。");
  define("Stability", "Stability measures whether training or serving maintains consistent behavior without crashes or large oscillations.", "稳定性衡量训练或服务能否保持一致行为，避免崩溃和剧烈波动。");
  define("Recovery time", "Recovery time measures how long a failed job or service takes to return to a healthy state.", "恢复时间衡量失败任务或服务恢复正常所需的时间。");
  define("Generalization", "Generalization measures performance on unseen data, domains, tasks, or distributions.", "泛化衡量模型在未见数据、领域、任务或分布上的表现。");
  define("Requests", "Requests are individual user or system calls that require inference or agent processing.", "请求是需要推理或 Agent 处理的单次用户或系统调用。");
  define("Prompt batches", "Prompt batches group requests for efficient scheduling and GPU execution.", "提示批次将多个请求组合起来，以提升调度与 GPU 执行效率。");
  define("KV state", "KV state is the cached key/value representation of context used during autoregressive inference.", "KV 状态是自回归推理中缓存上下文使用的 Key/Value 表示。");
  define("Sampling policy", "Sampling policy controls temperature, top-k, top-p, and other choices that shape generated tokens.", "采样策略控制温度、Top-K、Top-P 等影响生成 Token 的参数。");
  define("Concurrency", "Concurrency is the number of requests or tasks processed simultaneously.", "并发是系统同时处理的请求或任务数量。");
  define("Tokens", "Tokens are the model's basic text units for input, generation, and billing.", "Token 是模型处理输入、生成文本和计量成本的基本单位。");
  define("Cache state", "Cache state stores reusable intermediate results such as attention key/value blocks.", "缓存状态保存注意力 Key/Value 块等可复用中间结果。");
  define("Timing traces", "Timing traces record where latency is spent across queueing, prefill, decode, and transfer.", "时延轨迹记录延迟在排队、Prefill、Decode 与传输之间的分布。");
  define("Error codes", "Error codes classify failures such as invalid requests, timeouts, resource exhaustion, or tool errors.", "错误码对非法请求、超时、资源耗尽或工具错误等失败进行分类。");
  define("Usage stats", "Usage stats summarize token volume, request volume, cache reuse, and resource consumption.", "用量统计汇总 Token、请求、缓存复用与资源消耗。");
  define("TTFT", "Time to first token measures how quickly an inference request begins streaming its first output token.", "TTFT 衡量推理请求从发起到输出第一个 Token 的时间。");
  define("TPOT", "Time per output token measures the average decoding time for each generated token.", "TPOT 衡量每生成一个 Token 的平均解码时间。");
  define("KV hit rate", "KV hit rate is the fraction of requests that reuse existing KV cache state.", "KV 命中率是成功复用已有 KV Cache 状态的请求占比。");
  define("Error rate", "Error rate is the fraction of inference or agent requests that fail.", "错误率是推理或 Agent 请求失败的占比。");
  define("Task specs", "Task specs define the objective, constraints, success criteria, and allowed tools for an agent task.", "任务规范定义 Agent 任务的目标、约束、成功标准与可用工具。");
  define("Tool schemas", "Tool schemas define each external tool's inputs, outputs, permissions, and error behavior.", "工具协议定义每个外部工具的输入、输出、权限与错误行为。");
  define("Context state", "Context state is the task information currently available to an agent for its next decision.", "上下文状态是 Agent 在下一步决策时可用的任务信息。");
  define("Execution environment", "The execution environment provides the filesystem, tools, permissions, and runtime resources for agent actions.", "执行环境为 Agent 动作提供文件系统、工具、权限与运行资源。");
  define("Retry policy", "A retry policy defines when failed actions should be retried and how backoff or fallback is applied.", "重试策略定义失败动作何时重试，以及退避和降级方式。");
  define("Tool calls", "Tool calls are structured requests from an agent to external functions or services.", "工具调用是 Agent 向外部函数或服务发出的结构化请求。");
  define("Observations", "Observations are the returned results an agent receives after acting on the environment.", "观察结果是 Agent 对环境执行动作后获得的返回信息。");
  define("Artifacts", "Artifacts are durable outputs such as files, patches, reports, or generated datasets.", "产出文件是 Agent 生成的代码补丁、报告、数据集等可持久保存结果。");
  define("Execution traces", "Execution traces record the sequence of plans, tool calls, observations, and state changes in an agent run.", "执行轨迹记录 Agent 运行中的规划、工具调用、观察与状态变化。");
  define("Recovery actions", "Recovery actions repair a failed agent step through retry, replanning, tool switching, or escalation.", "恢复动作通过重试、重规划、切换工具或升级处理来修复失败步骤。");
  define("Task success", "Task success measures whether an agent completes the requested outcome and satisfies its constraints.", "任务成功率衡量 Agent 是否完成任务目标并满足约束。");
  define("Tool accuracy", "Tool accuracy measures whether an agent selects the correct tool and supplies valid arguments.", "工具准确率衡量 Agent 是否选择正确工具并给出有效参数。");
  define("Recovery rate", "Recovery rate measures how often an agent recovers from a failed or invalid action.", "恢复率衡量 Agent 从失败或无效动作中恢复的比例。");
  define("Step latency", "Step latency measures the time required for one agent reasoning or tool-action step.", "单步延迟衡量 Agent 一次推理或工具动作所需的时间。");
  define("Cost per task", "Cost per task measures the model, tool, and infrastructure expense required to complete one task.", "单任务成本衡量完成一个任务所需的模型、工具与基础设施开销。");
  define("Benchmarks", "Benchmarks are standardized tasks and scoring procedures used to compare model or agent behavior.", "基准测试是用于比较模型或 Agent 表现的标准任务与评分流程。");
  define("Traces", "Traces capture the detailed execution history of model or agent behavior.", "轨迹记录模型或 Agent 行为的详细执行历史。");
  define("Error slices", "Error slices group failures by capability, domain, language, or interaction pattern to guide diagnosis.", "错误切片按能力、领域、语言或交互模式归类失败，以辅助诊断。");
  define("Human rubrics", "Human rubrics provide structured criteria and examples for consistent expert evaluation.", "人工量表提供结构化标准与示例，使专家评测保持一致。");
  define("Adversarial sets", "Adversarial sets contain designed inputs that probe edge cases, attacks, and unsafe behavior.", "对抗测试集包含专门探测边界、攻击与不安全行为的输入。");
  define("Scores", "Scores turn evaluation criteria into quantitative or ordinal measurements.", "分数将评测标准转化为定量或有序的测量结果。");
  define("Failure taxonomy", "A failure taxonomy organizes observed errors into stable categories for diagnosis and regression tracking.", "失败分类把观察到的错误组织为稳定类别，用于诊断与回归追踪。");
  define("Release verdict", "A release verdict is the final evidence-based decision to ship, delay, or block a model or agent.", "发布结论是基于证据决定发布、延期或阻止模型/Agent 上线的结果。");
  define("Regression report", "A regression report compares current and baseline failures across critical capability slices.", "回归报告对比当前版本与基线在关键能力切片上的失败变化。");
  define("Model card", "A model card documents intended use, limitations, evaluation results, and safety considerations.", "模型卡记录预期用途、局限、评测结果与安全注意事项。");
  define("Robustness", "Robustness measures whether performance remains stable under noise, distribution shift, and adversarial input.", "鲁棒性衡量模型在噪声、分布变化与对抗输入下是否保持稳定表现。");
  define("Calibration", "Calibration measures whether confidence scores match observed correctness.", "校准衡量模型置信度与实际正确率是否匹配。");
  define("Cost to evaluate", "Cost to evaluate measures the compute, model, human, and tool expense of an evaluation process.", "评测成本衡量一次评测流程所需的算力、模型、人工与工具开销。");
  define("Cost Evaluation", "Cost evaluation measures the compute, serving, tool, and human expense of running a system.", "成本评测衡量运行系统所需的算力、服务、工具与人工开销。");
  define("Latency Evaluation", "Latency evaluation measures end-to-end and component-level response delay against service targets.", "延迟评测衡量端到端及各组件响应时间是否满足服务目标。");
  define("2021 — 2027", "This label marks the overall education period shown in the resume.", "该标签表示简历中的整体教育时间范围。");
  define("2026", "This label marks the year or time context of the adjacent experience or project.", "该标签标记相邻经历或项目所处的年份。");
  define("JUL — OCT 2026", "This label marks the Xiaomi internship period from July to October 2026.", "该标签表示 2026 年 7 月至 10 月的小米实习时间。");
  define("APR — JUL 2026", "This label marks the LMPool project period from April to July 2026.", "该标签表示 2026 年 4 月至 7 月的 LMPool 项目时间。");
  define("Beijing", "Beijing is the location associated with this education or work entry.", "北京是这条教育或工作经历对应的地点。");
  define("Shanghai", "Shanghai is the location associated with this education or work entry.", "上海是这条教育或工作经历对应的地点。");
  define("Hong Kong", "Hong Kong is the location associated with this education or research context.", "香港是这条教育或研究背景对应的地点。");
  define("Beijing Forestry University", "Beijing Forestry University is the undergraduate institution listed in the resume.", "北京林业大学是简历中列出的本科院校。");
  define("Hong Kong University of Science and Technology", "The Hong Kong University of Science and Technology is the graduate institution listed in the resume.", "香港科技大学是简历中列出的研究生院校。");
  define("School of Engineering", "The School of Engineering is the academic faculty associated with the graduate program.", "工学院是研究生项目所属的学院。");
  define("School of Information Science", "The School of Information Science is the academic school associated with the undergraduate program.", "信息学院是本科项目所属的学院。");
  define("School of Artificial Intelligence", "The School of Artificial Intelligence is the academic school associated with AI coursework or research.", "人工智能学院是与人工智能课程或研究相关的学院。");
  define("Hong Kong Generative AI Research and Development Center", "HKGAI is a Hong Kong research center focused on generative AI research, systems, and applications.", "HKGAI 是聚焦生成式人工智能研究、系统与应用的香港研究机构。");
  define("Xiaomi", "Xiaomi is the company associated with the chip-business post-training work in this portfolio.", "小米是本作品集中芯片业务后训练工作的关联公司。");
  define("LMPool", "LMPool is the multi-GPU LLM serving project described in this portfolio.", "LMPool 是本作品集中介绍的多 GPU LLM 服务项目。");
  define("Chip business", "Chip business refers to the semiconductor and chip-related business context of the Xiaomi work.", "芯片业务指小米工作所涉及的半导体与芯片业务背景。");
  define("RTL post-training", "RTL post-training adapts language models to generate and verify register-transfer-level hardware code.", "RTL 后训练使语言模型能够生成并验证寄存器传输级硬件代码。");
  define("Multilingual ASR", "Multilingual ASR converts speech in multiple languages into text and related structured outputs.", "多语种 ASR 将多种语言的语音转换为文字及相关结构化结果。");
  define("Government meetings", "Government meetings are the domain context used for multilingual speech processing in this project.", "政务会议是该项目多语种语音处理的应用场景。");
  define("EN · YUE · ZH", "These tags denote English, Cantonese, and Mandarin language coverage.", "该标签表示英语、粤语和普通话的语言覆盖。");
  define("EN", "EN denotes English-language capability coverage.", "EN 表示英语能力覆盖。");
  define("YUE", "YUE denotes Cantonese-language capability coverage.", "YUE 表示粤语能力覆盖。");
  define("ZH", "ZH denotes Mandarin Chinese-language capability coverage.", "ZH 表示普通话能力覆盖。");
  define("Algorithm design and analysis", "Algorithm design and analysis studies how to construct algorithms and prove their correctness and complexity.", "算法设计与分析研究如何构造算法，并分析其正确性与复杂度。");
  define("Artificial intelligence", "Artificial intelligence studies methods that enable machines to perceive, reason, learn, and act.", "人工智能研究使机器能够感知、推理、学习与行动的方法。");
  define("Machine learning", "Machine learning learns patterns and predictive functions from data rather than relying only on explicit rules.", "机器学习从数据中学习模式与预测函数，而不是只依赖显式规则。");
  define("Deep learning", "Deep learning uses multilayer neural networks to learn hierarchical representations.", "深度学习使用多层神经网络学习分层表示。");
  define("Reinforcement learning", "Reinforcement learning optimizes actions through rewards and environment interaction.", "强化学习通过奖励与环境交互来优化动作策略。");
  define("Large language models", "Large language models are Transformer-based models trained on broad text and code corpora for generation and reasoning.", "大语言模型是在广泛文本与代码语料上训练的 Transformer 模型，用于生成与推理。");
  define("Natural language processing", "Natural language processing studies computational methods for understanding and generating human language.", "自然语言处理研究理解和生成人类语言的计算方法。");
  define("Computer vision", "Computer vision studies methods for extracting semantic information from images and video.", "计算机视觉研究从图像与视频中提取语义信息的方法。");
  define("Machine learning ethics", "Machine learning ethics studies fairness, privacy, accountability, and social impact in ML systems.", "机器学习伦理研究 ML 系统中的公平性、隐私、责任与社会影响。");
  define("Linear algebra", "Linear algebra provides the vector, matrix, and decomposition foundations used throughout machine learning.", "线性代数提供机器学习中广泛使用的向量、矩阵与矩阵分解基础。");
  define("Calculus", "Calculus provides the derivatives and optimization foundations used to train models.", "微积分提供训练模型所需的导数与优化基础。");
  define("Probability and statistics", "Probability and statistics provide methods for modeling uncertainty, sampling, estimation, and evaluation.", "概率统计提供不确定性建模、采样、估计与评测方法。");
  define("Discrete mathematics", "Discrete mathematics studies discrete structures such as sets, graphs, logic, and combinatorics.", "离散数学研究集合、图、逻辑与组合等离散结构。");
  define("Data structures", "Data structures organize data for efficient storage, retrieval, and algorithmic operation.", "数据结构用于高效地组织、存储、检索和操作数据。");
  define("Database systems", "Database systems provide reliable storage, querying, transactions, and access control for structured data.", "数据库系统为结构化数据提供可靠存储、查询、事务与访问控制。");
  define("Operating systems", "Operating systems manage processes, memory, files, devices, and resource scheduling.", "操作系统管理进程、内存、文件、设备与资源调度。");
  define("Computer architecture", "Computer architecture studies processor organization, memory hierarchy, instruction execution, and performance.", "计算机体系结构研究处理器组织、存储层次、指令执行与性能。");
  define("Computer organization", "Computer organization connects digital components into processors, memory systems, and I/O subsystems.", "计算机组成将数字部件组合为处理器、存储系统与 I/O 子系统。");
  define("Computer networks", "Computer networks study protocols and architectures for reliable communication between distributed systems.", "计算机网络研究分布式系统之间可靠通信的协议与架构。");
  define("Network security", "Network security protects communication, identity, and infrastructure from unauthorized access and attacks.", "网络安全保护通信、身份与基础设施免受未授权访问和攻击。");
  define("Analog circuits", "Analog circuits process continuous voltage and current signals using components such as amplifiers and filters.", "模拟电路使用放大器、滤波器等元件处理连续电压与电流信号。");
  define("Digital circuits", "Digital circuits implement logic and state using discrete voltage levels and Boolean operations.", "数字电路使用离散电平与布尔运算实现逻辑和状态。");
  define("Compilers", "Compilers translate source code through parsing, intermediate representations, optimization, and code generation.", "编译器通过解析、中间表示、优化与代码生成来转换源代码。");
  define("Software engineering", "Software engineering applies engineering methods to design, build, test, and maintain reliable software.", "软件工程使用工程方法设计、构建、测试与维护可靠软件。");
  define("C programming", "C programming uses a compact systems language for memory-managed software, tooling, and performance-sensitive code.", "C 编程使用紧凑的系统级语言，编写需要显式内存管理与高性能的软件工具。");
  define("C++ programming", "C++ programming combines systems-level control with object-oriented and generic programming.", "C++ 编程结合系统级控制、面向对象与泛型编程。");
  define("C / C++", "C and C++ are systems programming languages used for performance-critical software and infrastructure.", "C/C++ 是用于高性能软件与底层基础设施的系统编程语言。");
  define("C", "C is a low-level systems language used for operating systems, embedded software, runtimes, and performance-critical components.", "C 是底层系统语言，常用于操作系统、嵌入式软件、运行时与高性能组件。");
  define("C++", "C++ combines low-level memory control with object-oriented and generic programming for performance-critical systems.", "C++ 结合底层内存控制、面向对象与泛型编程，适合高性能系统开发。");
  define("Java", "Java is a managed, object-oriented language widely used for backend services and large-scale systems.", "Java 是广泛用于后端服务与大规模系统的托管式面向对象语言。");
  define("Java programming", "Java programming builds portable object-oriented applications on the JVM.", "Java 编程在 JVM 上构建可移植的面向对象应用。");
  define("Java web backend", "Java web backend development builds APIs, business logic, and data services on the JVM.", "Java Web 后端在 JVM 上构建 API、业务逻辑与数据服务。");
  define("Python", "Python is a high-level language widely used for machine learning, data processing, automation, and backend tooling.", "Python 是广泛用于机器学习、数据处理、自动化与后端工具的高级语言。");
  define("Python programming", "Python programming builds readable scripts, data pipelines, services, and machine-learning workflows.", "Python 编程用于构建可读性强的脚本、数据流水线、服务与机器学习工作流。");
  define("Android development", "Android development builds mobile applications and services for the Android platform.", "Android 开发构建面向 Android 平台的移动应用与服务。");
  define("Web frontend", "Web frontend development implements interactive browser interfaces with HTML, CSS, JavaScript, and application frameworks.", "Web 前端使用 HTML、CSS、JavaScript 与应用框架实现交互式浏览器界面。");
  define("SQL", "SQL is the standard language for querying, transforming, and managing relational data.", "SQL 是查询、转换与管理关系型数据的标准语言。");
  define("Git", "Git is a distributed version-control system for tracking source history and coordinating changes.", "Git 是分布式版本控制系统，用于追踪源代码历史与协作修改。");
  define("Linux", "Linux is an open-source operating-system family widely used for servers, GPUs, containers, and development.", "Linux 是广泛用于服务器、GPU、容器与开发环境的开源操作系统家族。");
  define("Systems / research", "This label marks work that combines systems engineering with applied research.", "该标签表示系统工程建设与应用的结合。");
  define("Architecture", "Architecture defines the major components, interfaces, data flow, and responsibilities of a system.", "系统架构定义系统的主要组件、接口、数据流与职责边界。");
  define("Control plane", "The control plane makes routing, scheduling, metadata, and policy decisions without carrying the main data payload.", "控制面负责路由、调度、元数据与策略决策，不承载主要数据载荷。");
  define("Data plane", "The data plane carries the high-volume request, tensor, cache, or storage traffic.", "数据面承载高吞吐的请求、张量、缓存或存储流量。");
  define("Main process", "The main process coordinates ingress, dispatch, and result handling in this serving architecture.", "主进程在该服务架构中协调请求入口、分发与结果处理。");
  define("Global and local scheduling", "Global scheduling chooses a worker while local scheduling orders work inside each worker.", "全局调度选择执行节点，本地调度负责节点内部任务排序。");
  define("Transactional KV transfer", "Transactional KV transfer makes cache migration atomic across prepare, execute, publish, and finalize phases.", "事务式 KV 传输通过准备、执行、发布与完成阶段保证缓存迁移的原子性。");
  define("Missing prefill", "Missing prefill is the prompt computation not covered by an existing reusable KV prefix.", "缺失 prefill 是现有可复用 KV 前缀尚未覆盖的提示计算量。");
  define("Queue work", "Queue work represents pending prefill or decode load waiting in a worker.", "排队工作表示等待在节点中的待处理 Prefill 或 Decode 负载。");
  define("Reclaim", "Reclaim pressure reflects the cost of freeing cache blocks when capacity is constrained.", "回收压力反映在容量受限时释放缓存块的代价。");
  define("Locality", "Locality measures how much requests can reuse nearby or already-cached state instead of transferring it.", "局部性衡量请求可复用邻近或已缓存状态、从而减少迁移的程度。");
  define("Load skew", "Load skew is an imbalance in request or compute demand across workers.", "负载倾斜是请求或计算需求在多个节点之间分布不均。");
  define("Memory skew", "Memory skew is an imbalance in cache or memory capacity usage across workers.", "显存倾斜是缓存或显存容量利用率在多个节点之间分布不均。");
  define("Routing sweep", "A routing sweep compares scheduling policies across request patterns and model configurations.", "路由扫描在不同请求模式与模型配置下比较调度策略。");
  define("In-domain", "In-domain evaluation measures behavior on the same task and distribution represented in training.", "域内评测衡量模型在训练所覆盖任务与分布上的表现。");
  define("Out-of-domain", "Out-of-domain evaluation tests behavior on distributions or tasks not represented directly during training.", "域外评测测试模型在训练未直接覆盖的分布或任务上的表现。");
  define("Generalization trend", "A generalization trend shows how performance on unseen cases changes over training.", "泛化趋势展示训练过程中未见案例表现的变化。");
  define("Findings", "Findings summarize validated observations and their implications.", "实验结论总结经过验证的观察及其影响。");
  define("Benchmark design", "Benchmark design defines representative tasks, scoring rules, controls, and failure analysis for comparison.", "评测设计定义具有代表性的任务、评分规则、控制条件与失败分析。");
  define("Correctness", "Correctness measures whether a system produces the specified result without semantic or data errors.", "正确性衡量系统是否在无语义或数据错误的情况下产生预期结果。");
  define("Correctness tests", "Correctness tests verify system behavior against expected outputs, invariants, and edge cases.", "正确性测试依据预期输出、不变量与边界案例验证系统行为。");
  define("System architecture", "System architecture describes component boundaries, interactions, data flow, and operational constraints.", "系统架构描述组件边界、交互、数据流与运行约束。");
  define("Design rule", "A design rule is a constraint that keeps system behavior safe, consistent, and maintainable.", "设计原则是保障系统安全、一致与可维护的约束。");
  define("Decision model", "A decision model defines the signals, weights, and constraints used to select an action.", "决策模型定义选择动作时使用的信号、权重与约束。");
  define("The learning loop", "The learning loop connects generation, verification, reward, update, and data feedback across training iterations.", "训练闭环连接生成、验证、奖励、更新与数据反馈的多轮训练过程。");
  define("Golden code", "Golden code is a trusted reference implementation used to validate generated code and reward signals.", "已验证代码是用于校验生成代码与奖励信号的可靠参考实现。");
  define("Generate", "Generation produces candidate outputs such as code, reasoning traces, or tool calls.", "生成阶段产出代码、推理轨迹或工具调用等候选结果。");
  define("Verify", "Verification checks generated behavior against tests, constraints, or human-defined criteria.", "验证阶段依据测试、约束或人工标准检查生成行为。");
  define("Update", "The update step changes model weights, data, prompts, or system policies from training feedback.", "更新步骤根据训练反馈修改模型权重、数据、提示或系统策略。");
  define("Prepare", "Prepare reserves resources and locks the state required for a transactional operation.", "准备阶段预留资源并锁定事务操作所需状态。");
  define("Execute", "Execute performs the main payload operation, such as sending a packed KV tensor.", "执行阶段完成主要载荷操作，例如发送打包的 KV 张量。");
  define("Publish", "Publish atomically makes a completed transfer visible to other components.", "发布阶段原子地将已完成传输结果对其他组件可见。");
  define("Finalize", "Finalize releases transactional resources after publication or aborts cleanup safely.", "完成阶段在发布后释放事务资源，或安全清理中止状态。");
  define("The central tension", "The core tension names the main tradeoff the project must resolve.", "核心矛盾概括项目必须解决的主要权衡。");
  define("Post-training / data", "This classification marks work spanning post-training algorithms and data construction.", "该分类表示工作同时覆盖后训练算法与数据构建。");
  define("Measured result / 5× prefix", "This label identifies measured system metrics under a long shared-prefix workload.", "该标签表示长共享前缀负载下的实测系统指标。");
  define("Figure 01 / Data", "This label identifies the dataset-construction figure.", "该标签标识数据集构建图。");
  define("Figure 02 / Training", "This label identifies the training-path figure.", "该标签标识训练路径图。");
  define("Figure 03 / Evaluation", "This label identifies the evaluation figure.", "该标签标识评测图。");
  define("Byte correctness", "Byte correctness verifies that transferred or cached tensors preserve exact numerical content.", "字节级正确性验证传输或缓存后的张量数值内容完全一致。");
  define("Cost/latency eval", "Cost and latency evaluation measures whether a system meets production efficiency constraints at an acceptable quality level.", "成本/延迟评测衡量系统能否在可接受质量下满足生产效率和响应时间约束。");
  define("Data mixture", "A data mixture defines the proportions of domains, tasks, languages, and quality tiers used in training.", "数据配比定义训练中不同领域、任务、语言与质量层级的数据比例。");
  define("Evaluation", "Evaluation converts model or system behavior into comparable evidence about quality, safety, and fitness for use.", "评测将模型或系统行为转化为关于质量、安全性与适用性的可比较证据。");
  define("Inference systems", "Inference systems turn trained models into low-latency, high-throughput, reliable services.", "推理系统把训练后的模型转化为低延迟、高吞吐、可靠的在线服务。");
  define("Tokenizer design", "Tokenizer design defines vocabulary, segmentation, special tokens, and multilingual coverage for a language model.", "分词器设计定义语言模型的词表、切分方式、特殊 Token 与多语言覆盖。");
  define("Training systems", "Training systems coordinate data loading, distributed execution, optimization, communication, checkpointing, and observability.", "训练系统协调数据加载、分布式执行、优化、通信、检查点与可观测性。");
  define("Transformer", "Transformer is the attention-based neural architecture underlying most modern large language models.", "Transformer 是大多数现代大语言模型所采用的基于注意力的神经网络架构。");

  function tagKey(tag) {
    return normalize(tag.dataset.termKey || tag.dataset.en || tag.textContent);
  }

  function tagTitle(tag) {
    return localized(tag, tag.dataset.termKey || tag.textContent.trim());
  }

  function contextFor(tag, targetLanguage) {
    if (tag.closest(".usecase-card")) {
      const card = tag.closest(".usecase-card");
      return `USE CASE / ${localized(card.querySelector("h3"), "Business workflow")}`;
    }

    const stage = tag.closest(".workflow-stage");
    if (stage) {
      const stageName = localized(stage.querySelector(".workflow-stage-head > p"), "Roadmap");
      const group = tag.closest(".workflow-anatomy > div");
      const category = localized(group?.querySelector(".workflow-category-label"), "");
      return category ? `${stageName} / ${category}` : `AGENT ROADMAP / ${stageName}`;
    }

    const skill = tag.closest(".skill-category");
    if (skill) {
      return `TECH STACK / ${localized(skill.querySelector("h3"), "")}`;
    }

    const section = tag.closest("section");
    const heading = section?.querySelector("h2");
    return heading ? localized(heading, "PORTFOLIO") : "PORTFOLIO GLOSSARY";
  }

  function decorateTag(tag) {
    if (tag.dataset.termKey) return;
    const key = normalize(tag.dataset.en || tag.textContent);
    if (!key || !definitions[key]) return;
    tag.dataset.termKey = key;
    tag.dataset.definitionStatus = "curated";
    tag.classList.add("term-tag");
    tag.tabIndex = 0;
    tag.setAttribute("role", "button");
    tag.setAttribute("aria-haspopup", "dialog");
    tag.setAttribute("title", language() === "zh" ? "查看术语解释" : "View definition");
  }

  function decorateTags(root = document) {
    if (root.matches?.(tagSelector)) decorateTag(root);
    root.querySelectorAll?.(tagSelector).forEach(decorateTag);
    window.dispatchEvent(new CustomEvent("portfolio:terms-updated"));
  }

  function openTerm(tag) {
    if (!modal || !modalTitle || !modalDescription) return;
    const targetLanguage = language();
    const key = tagKey(tag);
    const definition = definitions[key];
    if (!definition) return;
    const context = contextFor(tag, targetLanguage);

    activeTag = tag;
    modalTitle.textContent = tagTitle(tag);
    modalContext.textContent = context;
    modalDescription.textContent = definition[targetLanguage];
    modalClose?.setAttribute(
      "aria-label",
      targetLanguage === "zh" ? "关闭术语解释" : "Close definition"
    );
    modal.hidden = false;
    document.body.classList.add("term-modal-open");

    window.PortfolioTextMotion?.cancel(modalTitle);
    window.PortfolioTextMotion?.cancel(modalDescription);
    window.PortfolioTextMotion?.typeText(modalTitle, tagTitle(tag));
    window.PortfolioTextMotion?.typeText(modalDescription, definition[targetLanguage], {
      delay: 240
    });

    modalClose?.focus();
  }

  function closeTerm() {
    if (!modal || modal.hidden) return;
    window.PortfolioTextMotion?.cancel(modalTitle);
    window.PortfolioTextMotion?.cancel(modalDescription);
    modal.hidden = true;
    document.body.classList.remove("term-modal-open");
    activeTag?.focus();
    activeTag = null;
  }

  decorateTags();

  const heroStack = document.querySelector("[data-tech-stack-output]");
  if (heroStack) {
    new MutationObserver(() => decorateTags(heroStack)).observe(heroStack, { childList: true });
  }

  document.addEventListener("click", (event) => {
    const tag = event.target.closest(".term-tag");
    if (tag) {
      event.preventDefault();
      openTerm(tag);
      return;
    }
    if (event.target === modal) closeTerm();
  });

  document.addEventListener("keydown", (event) => {
    const tag = event.target.closest?.(".term-tag");
    if (tag && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openTerm(tag);
    }
    if (event.key === "Escape") closeTerm();
  });

  modalClose?.addEventListener("click", closeTerm);
  document.querySelector(".language-switch")?.addEventListener("click", closeTerm);
  document.querySelector(".theme-toggle")?.addEventListener("click", closeTerm);
})();
