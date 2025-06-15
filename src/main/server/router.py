
@app.route('/api/generate_schedule', methods=['POST'])
def generate_schedule():
    data = request.json
    user_tasks = data.get('text', '')
    
    if not user_tasks:
        return jsonify({"error": "缺少text参数"}), 400

    # 1. 构造初始状态（封装对整个“专家系统流程”的输入）
    initial_state = ScheduleState(
        user_tasks=user_tasks,
        messages=[],
        schedule_result="无内容",
        current_agent="任务量估计专家",
        completed=False
    )
    
    # 2. 调用多智能体工作流（图形）处理，step-by-step
    final_state = None
    for output in schedule_graph.stream(initial_state):
        if isinstance(output, dict) and "state" in output:
            state = output["state"]
            if state["completed"]:
                final_state = state
                break

    # 3. 最终结果获取和结构化处理
    # 提取和修复json结果（模型输出松散，需加强健壮性）
    try:
        json_part = extract_json(planner_response_content)
        fixed_json = fix_json(json_part)
        schedule_data = json.loads(fixed_json)

        return jsonify({
            "schedule": schedule_data,
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"解析结果失败: {str(e)}",
            "raw_content": planner_response_content[:500]
        }), 500
