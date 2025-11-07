import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ItemsTable({ items, onChange }) {
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Auto-calculate total
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity || 0;
      const price = field === 'price' ? parseFloat(value) || 0 : newItems[index].price || 0;
      newItems[index].total = quantity * price;
    }

    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { item: "", description: "", quantity: 1, price: 0, delivery: "", total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[200px]">Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Qty</TableHead>
              <TableHead className="w-[120px]">Price</TableHead>
              <TableHead className="w-[150px]">Delivery</TableHead>
              <TableHead className="w-[120px]">Total</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={item.item}
                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                    placeholder="Item name"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.delivery}
                    onChange={(e) => handleItemChange(index, 'delivery', e.target.value)}
                    placeholder="2-3 days"
                  />
                </TableCell>
                <TableCell className="font-semibold">
                  ${(item.total || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
        <div className="text-right">
          <p className="text-sm text-slate-600">Total Amount</p>
          <p className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}