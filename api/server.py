# from dextr.helpers.helpers import extreme_points
from importlib.util import decode_source
import json
import urllib
import cv2
# from dextr.inference import dextr
import numpy as np
from numpy.linalg import norm
import seaborn
import pyzbar.pyzbar as pyzbar
import joblib
import random
import base64
import torch
import pandas as pd
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
from matplotlib.pyplot import pie
from fastapi import FastAPI, Request, Form, File, Response, UploadFile
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError, validator
from typing import List, Optional
from scipy.spatial import Delaunay, Voronoi, voronoi_plot_2d

import os
import sys
import time
from pathlib import Path
from mmdet.apis import init_detector, inference_detector
sys.path.append("/home/kabin/2023/konjac_project/utils")
import helper

import torch
import torch.nn as nn
import torchvision
import torch.optim as optim
import torch.optim.lr_scheduler as lr_scheduler
from torchvision import models, transforms, datasets
from torchvision.models import ResNet50_Weights, resnet50, resnet101, ResNet101_Weights

import occlusion_model.custom_resnet as OcclussionModel

transform_inference = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])  # Normalize images
    # transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))  # Normalize images
])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
if torch.cuda.is_available():
    print(f'>>>>>>>>>>>       cuda is available       <<<<<<<<<<<<')
else:
    print(f'>>>>>>>>>>>       cuda is not available       <<<<<<<<<<<<')
model = OcclussionModel.load_model("/home/kabin/2023/konjac_project/paper_revision/save_model/20241028_125758/best_model_no_outline.pth", device, ResNet50_Weights.IMAGENET1K_V1)
preprocess = ResNet50_Weights.IMAGENET1K_V2.transforms()

app = FastAPI()
origins = ["http://localhost:4200", "http://172.23.161.109:4200"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict HTTP methods if needed (e.g., ["GET", "POST"])
    allow_headers=["*"],  # You can restrict headers if needed
)

colors = [tuple([random.randint(0, 255) for _ in range(3)])
          for _ in range(100)]

mask_rcnn_config_path = '/home/kabin/mmdetection_2.25/work_dirs/mask_rcnn_r50_caffe_fpn_1x_coco_1000/mask_rcnn_r50_caffe_fpn_1x_coco_1000.py'
mask_rcnn_model_path = '/home/kabin/mmdetection_2.25/work_dirs/mask_rcnn_r50_caffe_fpn_1x_coco_1000/best_bbox_mAP_epoch_11.pth'
mmdet_model = init_detector(mask_rcnn_config_path, mask_rcnn_model_path, device='cuda:0')

rdf_model = joblib.load('/home/kabin/konjac_weight_app/weights/rdf.joblib')
expandsion_model = joblib.load(
    "/home/kabin/konjac_weight_app/weights/rdf_all_features_0425.joblib")


@app.post("/detect_weight_visible")
async def predict_konjac_weight(file: UploadFile = File(...), qrcodeSize: int = Form(...)):
    start = time.time()
    
    response_msg = ''
    print(f'received file: {file.filename}')
    print(f'received qrcodeSize: {qrcodeSize}')
    contents = await file.read()
    image = Image.open(BytesIO(contents))
    image = np.array(image)
    # Detect QR code
    decodedObjs = helper.decode(image, qrcodeSize)
    print(decodedObjs)
    if decodedObjs['found_qr']:
        # detect konjac
        data = []
        pred = inference_detector(mmdet_model, image)
        pixel_per_metric = decodedObjs['pixel_per_metric']
        
        threshold = 0.3
        konjac_bbox_ = np.array(pred[0][0])
        konjac_masks = np.array(pred[1][0])
        print(f'len konjac_bbox: {len(konjac_bbox_)}')
        print(f'len konjac_masks: {len(konjac_masks)}')
        konjac_bbox = konjac_bbox_[konjac_bbox_[:, 4] > threshold]
        konjac_masks = konjac_masks[konjac_bbox_[:, 4] > threshold]
        print(f'removed {len(konjac_bbox_) - len(konjac_bbox)}')
        
        im_w, im_h = image.shape[1], image.shape[0]
        zero_mask = np.zeros((im_h, im_w), dtype=np.uint8)
        
        for mask in konjac_masks:
            zero_mask = np.logical_or(mask, zero_mask)
        
        center_point = []
        for indx, bbox in enumerate(konjac_bbox):
            center = [int((bbox[0] + bbox[2]) / 2), int((bbox[1] + bbox[3]) / 2)]
            center_point.append(center)
        
        
        regulation_points = [[10, 10], [im_h-10, im_w-10]]
        count_reg = 0
        for index, reg_id in enumerate(regulation_points):
            reg_points_1 = [reg_points for reg_points in range(10, im_w, 500)]
            reg_points_2 = [reg_points for reg_points in range(10, im_h, 500)]
            for reg_point in reg_points_1:
                # print([reg_point, reg_id[0]])
                center_point.append([reg_point, reg_id[0]])
                count_reg += 1
            for reg_point in reg_points_2:
                # print([reg_id[1], reg_point])
                center_point.append([reg_id[1], reg_point])
                count_reg += 1
        
        center_point_np = np.array(center_point)
        tri = Delaunay(center_point_np)
        Neib = helper.find_neighbors(tri)
        neighbors = [list(filter(lambda x: x not in range(center_point_np.shape[0] - len(regulation_points), center_point_np.shape[0]), Neib[i])) for i in range(len(Neib))]
        vor = Voronoi(center_point_np)

        # remove regulation points from neighbors
        for i in range(len(neighbors)):
            for j in range(center_point_np.shape[0] - count_reg, center_point_np.shape[0], 1):
                if j in neighbors[i]:
                    neighbors[i].remove(j)

        print(f'neighbors: {len(neighbors)}')
        
        print(f'processing occlusion')
        num_occluded = 0
        num_not_occluded = 0
        occluded_images = []
        
        for mask_index, mask in enumerate(konjac_masks):
            if len(neighbors[mask_index]) == 0:
                continue
            occlusion_image = helper.occlusion_input(Image.fromarray(image), mask_index, neighbors[mask_index], konjac_masks, with_bg=False)
            # Image.fromarray(occlusion_image).save(f'./occlusion_inference/occlusion_{mask_index}.png')
            # print(f'occlusion_image: {occlusion_image.shape}')
            x, y = np.where(mask == 1)
            x1, y1, x2, y2 = min(x), min(y), max(x), max(y)
            padding = 0
            cropped = image[x1 - padding:x2 + padding, y1 - padding:y2 + padding]
            
            w_px, h_px = x2 - x1, y2 - y1
            w_cm, h_cm = helper.px_2_cm(np.array(konjac_bbox[mask_index][:4], dtype=int), pixel_per_metric)
            
            circularity = helper.get_circularity(mask[x1 - padding:x2 + padding, y1 - padding:y2 + padding])
            occluded_images.append(occlusion_image)
            data.append([w_cm, h_cm])
        
        preds = []
        image_batch = []
        for i, occlusion_image in enumerate(occluded_images):
            print(f'classifying occlusion image: {i}/{len(occluded_images)}')
            occlusion_image = Image.fromarray(occlusion_image)
            occlusion_image = preprocess(occlusion_image).unsqueeze(0)
            _, pred = OcclussionModel.run_inference(model, occlusion_image, device)
            image_batch.append(occlusion_image)
            preds.append(pred)
        
        # !Not ideal for large number of images
        # batch_tensor = torch.stack(image_batch)
        # outputs, _ = model(batch_tensor.to(device))
        # _, pred = torch.max(outputs.data, 1)
        # pred = pred.cpu().numpy().squeeze()
        # print(f'outputs: {pred.shape}')
        
        preds = np.array(preds)
        data = np.array(data)
        visibile_konjac = data[preds == 1]
        occluded_konjac = data[preds == 0]
        print(f'visible konjac: {len(visibile_konjac)}, occluded konjac: {len(occluded_konjac)}')
        # print(f'visible konjac: {visibile_konjac}, occluded konjac: {occluded_konjac}')
        pred_weight = rdf_model.predict(visibile_konjac)
        pred_weight = pred_weight.tolist()
        pred_weight = [int(value) for value in pred_weight]
        response_msg = "found_qr"
        additional_info = {
            'info': response_msg,
            'weights': pred_weight,
            'size': pixel_per_metric
        }
    else:
        response_msg = "qr not found"
        additional_info = {
            'info': response_msg,
            'size': pixel_per_metric
        }
    
    buffer = BytesIO()
    image = Image.fromarray(image)
    image.save(buffer, format="JPEG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    end_time = time.time()
    print(f'time: {end_time - start:.2f}s')
    response_data = {
        'info': additional_info,
        'image': img_base64
    }
    
    return response_data

if __name__ == '__main__':
    import uvicorn

    # make the app string equal to whatever the name of this file is
    app_str = 'server:app'
    uvicorn.run(app_str, host="0.0.0.0", port=8000, reload=True, workers=1)