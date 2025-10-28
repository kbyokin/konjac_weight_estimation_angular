import torch
import torch.nn as nn
import torchvision
import torch.optim as optim
import torch.optim.lr_scheduler as lr_scheduler
from torchvision import models, transforms, datasets
from torchvision.models import ResNet50_Weights, resnet50, resnet101, ResNet101_Weights

class CustomResNet(nn.Module):
    def __init__(self):
        super(CustomResNet, self).__init__()
        self.model = torchvision.models.resnet18(pretrained=True)
        self.dropout = nn.Dropout2d(p=0.3)  # Applying 2D dropout with a probability of 0.2
        self.model.fc = nn.Sequential(
            nn.Dropout(0.2),  # Add dropout with a probability of 0.5
            nn.Linear(self.model.fc.in_features, 2),
        )

    def forward(self, x):
        return self.model(x)
    
class ModifiedResNet(nn.Module):
    def __init__(self, original_model, feature_dim=2048, num_classes=2):
        super(ModifiedResNet, self).__init__()
        
        # Remove the final fully connected layer
        self.features = nn.Sequential(*list(original_model.children())[:-1])
        
        # Add new layers
        self.fc1 = nn.Linear(feature_dim, feature_dim)
        nn.init.xavier_normal_(self.fc1.weight)  # Add proper initialization
        nn.init.zeros_(self.fc1.bias)
        self.hidden_dim = feature_dim // 2
        
        self.classifier = nn.Sequential(
            nn.Linear(feature_dim, self.hidden_dim),
            nn.BatchNorm1d(self.hidden_dim),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(self.hidden_dim, num_classes)
        )
        
        # Initialize classifier layers
        for m in self.classifier.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_normal_(m.weight)
                nn.init.zeros_(m.bias)
        
    def forward(self, x):
        # Get features
        x = self.features(x)
        x = torch.flatten(x, 1)
        
        # Add checks for NaN
        if torch.isnan(x).any():
            print("NaN detected after features")
        
        # Get embedding features for center loss
        feat = self.fc1(x)
        
        # Add batch normalization for feature stability
        feat = nn.functional.normalize(feat, p=2, dim=1)  # L2 normalization
        
        if torch.isnan(feat).any():
            print("NaN detected after fc1")
        
        # Get final output
        out = self.classifier(feat)
        # print(feat)
        
        return out, feat
    
def load_model(model_path, device, weight):
    original_model = resnet50(weights=weight)
    model = ModifiedResNet(original_model, 2048, 2)
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    return model

def preprocess_image(image_path, preprocess):
    image = Image.open(image_path)
    image = preprocess(image).unsqueeze(0)
    return image

def run_inference(model, image, device):
    with torch.no_grad():
        image = image.to(device)
        # feature, output = model(image) # old
        output, feature = model(image)
        _, predicted = torch.max(output, 1)
        return feature, predicted.item()