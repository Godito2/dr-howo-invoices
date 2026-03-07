import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";

export default function ItemsTable({ items, onChange, currency = "USD" }) {
  const [uploadingIndex, setUploadingIndex] = React.useState(null);

  const currencySymbol = currency === "TZS" ? "TZS" : "$";

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    if (field === 'quantity' || field === 'price' || field === 'delivery_price' || field === 'vat') {
      const currentItem = newItems[index];
      const quantity = parseFloat(currentItem.quantity) || 0;
      const price = parseFloat(currentItem.price) || 0;
      const deliveryPrice = parseFloat(currentItem.delivery_price) || 0;
      const vat = parseFloat(field === 'vat' ? value : currentItem.vat ?? 18) || 0;
      const subtotal = (quantity * price) + deliveryPrice;
      newItems[index].total = subtotal * (1 + vat / 100);
    }

    onChange(newItems);
  };

  const handleImageUpload = async (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingIndex(index);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(r => r.file_url);
      
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        images: [...(newItems[index].images || []), ...newImageUrls]
      };
      onChange(newItems);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
    setUploadingIndex(null);
  };

  const removeImage = (itemIndex, imageIndex) => {
    const newItems = [...items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      images: newItems[itemIndex].images.filter((_, i) => i !== imageIndex)
    };
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { item: "", description: "", quantity: 1, price: 0, delivery_price: 0, vat: 18, total: 0, images: [] }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 bg-slate-50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-slate-700">Item {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  value={item.item}
                  onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                  placeholder="Item name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Price ({currencySymbol})</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.delivery_price || 0}
                  onChange={(e) => handleItemChange(index, 'delivery_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                placeholder="Detailed item description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Price ({currencySymbol})</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total</label>
                <Input
                  value={`${currencySymbol}${(item.total || 0).toLocaleString()}`}
                  disabled
                  className="font-semibold bg-white"
                />
              </div>
            </div>

            {/* Item Images */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Images</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-white">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(index, e)}
                  className="hidden"
                  id={`item-image-upload-${index}`}
                  disabled={uploadingIndex === index}
                />
                <label htmlFor={`item-image-upload-${index}`} className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {uploadingIndex === index ? (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                    <p className="text-sm text-slate-600">
                      {uploadingIndex === index ? "Uploading..." : "Click to upload images for this item"}
                    </p>
                  </div>
                </label>

                {item.images && item.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {item.images.map((url, imgIndex) => (
                      <div key={imgIndex} className="relative group">
                        <img
                          src={url}
                          alt={`Item ${index + 1} - Image ${imgIndex + 1}`}
                          className="w-full h-24 object-cover rounded border-2 border-slate-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, imgIndex)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
        <div className="text-right">
          <p className="text-sm text-slate-600">Total Amount</p>
          <p className="text-2xl font-bold text-blue-600">{currencySymbol}{totalAmount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}