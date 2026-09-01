import os
import gc
import torch
from transformers import DistilBertForSequenceClassification

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
BERT_DIR = os.path.join(MODELS_DIR, "bert_model")
OUTPUT_PATH = os.path.join(MODELS_DIR, "quantized_bert.pt")

def quantize():
    print("[SmartDesk Build] Quantizing DistilBERT to INT8 for zero-overhead runtime loading...")
    model = DistilBertForSequenceClassification.from_pretrained(BERT_DIR, low_cpu_mem_usage=True)
    quantized_model = torch.quantization.quantize_dynamic(
        model, {torch.nn.Linear}, dtype=torch.qint8
    )
    torch.save(quantized_model, OUTPUT_PATH)
    print(f"[SmartDesk Build] Quantized model saved to {OUTPUT_PATH} [OK]")

if __name__ == "__main__":
    quantize()
