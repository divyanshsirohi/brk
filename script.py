import os
import pyheif
from PIL import Image

input_folder = "./public"
output_folder = "./public/photos"

filenames = [
    "IMG_2078", "IMG_2092", "IMG_2171", "IMG_2276", "IMG_2423", "IMG_2504",
    "IMG_3018", "IMG_3113", "IMG_3235", "IMG_3342", "IMG_3343", "IMG_3346",
    "IMG_3379", "IMG_3416", "IMG_3430", "IMG_3437", "IMG_3883", "IMG_4035",
    "IMG_4872", "IMG_5852", "IMG_5860"
]

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for name in filenames:
    heic_path = os.path.join(input_folder, f"{name}.HEIC")
    jpg_path = os.path.join(output_folder, f"{name}.jpg")
    try:
        heif_file = pyheif.read(heic_path)
        image = Image.frombytes(
            heif_file.mode, heif_file.size, heif_file.data,
            "raw", heif_file.mode, heif_file.stride,
        )
        image.save(jpg_path, "JPEG")
        print(f"✅ Converted: {jpg_path}")
    except Exception as e:
        print(f"❌ Failed to convert {name}: {e}")
