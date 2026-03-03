import openai
import os
import logging
import csv
from datetime import datetime
from typing import Optional

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("ecommerce_copy.log"),
        logging.StreamHandler()
    ]
)

def generate_ecommerce_copy(
    sku: str,
    style: str,
    platform: str,
    target_market: str = "CN"
) -> Optional[str]:
    """
    生成跨境电商AIGC文案
    :param sku: 商品SKU
    :param style: 文案风格（如甜酷、通勤）
    :param platform: 平台（小红书、Amazon等）
    :param target_market: 目标市场（CN/NA/EU）
    :return: 生成的文案或None（失败时）
    """
    # 1. 参数校验
    if not all([sku, style, platform]):
        logging.error("参数缺失：sku、style、platform不能为空")
        return None

    try:
        # 2. 初始化OpenAI客户端（从环境变量读取密钥）
        client = openai.OpenAI(
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"  # 修正后的地址
        )

        # 3. 根据目标市场生成提示词
        if target_market == "NA":
            prompt = (
                f"Generate {style} style copy for {sku} on {platform}, "
                "highlight key selling points, 50-80 words, suitable for North American consumers."
            )
        elif target_market == "EU":
            prompt = (
                f"Generate {style} style copy for {sku} on {platform}, "
                "highlight key selling points, 50-80 words, suitable for European consumers."
            )
        else:
            prompt = (
                f"为{sku}生成{platform}平台的{style}风格文案，"
                "突出核心卖点，50-80字，符合国内用户阅读习惯。"
            )

        # 4. 调用API
        response = client.chat.completions.create(
            model="qwen-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        copy_text = response.choices[0].message.content.strip()

        # 5. 记录日志
        logging.info(f"成功生成文案 | SKU: {sku} | 平台: {platform} | 市场: {target_market}")

        # 6. 自动保存到CSV
        today = datetime.now().strftime("%Y-%m-%d")
        filename = f"ecommerce_copies_{today}.csv"
        file_exists = os.path.exists(filename)

        with open(filename, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["时间", "SKU", "风格", "平台", "目标市场", "文案"])
            writer.writerow([
                datetime.now().isoformat(),
                sku,
                style,
                platform,
                target_market,
                copy_text
            ])

        return copy_text

    except openai.APIError as e:
        logging.error(f"API调用失败: {str(e)}")
        return None
    except Exception as e:
        logging.error(f"未知错误: {str(e)}")
        return None

if __name__ == "__main__":
    # 测试调用
    result = generate_ecommerce_copy(
        sku="夏季连衣裙",
        style="甜酷",
        platform="小红书",
        target_market="CN"
    )
    if result:
        print("生成的文案：", result)
    else:
        print("生成失败，请检查日志")