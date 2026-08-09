import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addItem, CartItem, CartModifier } from '../store/slices/cartSlice';

interface ItemModalProps {
  item: any;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const handleOptionToggle = (groupId: string, optionId: string, maxSelection: number | null) => {
    setSelectedOptions(prev => {
      const groupSelections = prev[groupId] || [];
      
      if (maxSelection === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      
      const isSelected = groupSelections.includes(optionId);
      if (isSelected) {
        return { ...prev, [groupId]: groupSelections.filter(id => id !== optionId) };
      } else {
        if (maxSelection !== null && groupSelections.length >= maxSelection) {
          return prev;
        }
        return { ...prev, [groupId]: [...groupSelections, optionId] };
      }
    });
  };

  const calculateTotal = () => {
    let total = item.price;
    item.modifierGroups?.forEach((group: any) => {
      const selections = selectedOptions[group.id] || [];
      selections.forEach((optionId: string) => {
        const option = group.options.find((o: any) => o.id === optionId);
        if (option) total += option.price;
      });
    });
    return total;
  };

  const handleAddToCart = () => {
    const missingRequired = item.modifierGroups?.find(
      (g: any) => g.isRequired && (!selectedOptions[g.id] || selectedOptions[g.id].length < g.minSelection)
    );

    if (missingRequired) {
      alert(`Please complete required selection: ${missingRequired.name}`);
      return;
    }

    const modifiers: CartModifier[] = [];
    let optionsHash = '';

    item.modifierGroups?.forEach((group: any) => {
      const selections = selectedOptions[group.id] || [];
      selections.forEach((optionId: string) => {
        const option = group.options.find((o: any) => o.id === optionId);
        if (option) {
          modifiers.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            price: option.price
          });
          optionsHash += option.id;
        }
      });
    });

    const cartItemId = `${item.id}-${optionsHash}`;

    dispatch(addItem({
      id: cartItemId,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity,
      image: item.image,
      modifiers,
      totalPrice: calculateTotal()
    }));

    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}></div>
      
      <div style={{ position: 'relative', background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out' }}>
        {item.image && (
          <div style={{ height: '250px', background: `url(${item.image}) center/cover` }}></div>
        )}
        
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <X size={20} />
        </button>

        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{item.name}</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>{item.description}</p>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '2rem' }}>
            ₨ {item.price.toFixed(2)}
          </div>

          {item.modifierGroups?.map((group: any) => (
            <div key={group.id} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{group.name}</h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, background: group.isRequired ? '#ffe6eb' : '#e2e8f0', color: group.isRequired ? '#e11d48' : '#64748b', padding: '4px 8px', borderRadius: '9999px' }}>
                  {group.isRequired ? 'Required' : 'Optional'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {group.options?.map((option: any) => {
                  const isSelected = (selectedOptions[group.id] || []).includes(option.id);
                  const isRadio = group.maxSelection === 1;
                  
                  return (
                    <label key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: `2px solid ${isSelected ? 'var(--primary-color)' : '#e2e8f0'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input 
                          type={isRadio ? "radio" : "checkbox"} 
                          name={group.id}
                          checked={isSelected}
                          onChange={() => handleOptionToggle(group.id, option.id, group.maxSelection)}
                          style={{ accentColor: 'var(--primary-color)', width: '1.2rem', height: '1.2rem' }}
                        />
                        <span style={{ fontWeight: 500 }}>{option.name}</span>
                      </div>
                      {option.price > 0 && <span style={{ color: 'var(--text-light)' }}>+₨ {option.price.toFixed(2)}</span>}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '9999px', padding: '0.25rem' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'white', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <Minus size={18} />
              </button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'white', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <Plus size={18} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              style={{ flex: 1, background: 'var(--primary-color)', color: 'white', border: 'none', padding: '1rem', borderRadius: '9999px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Add to Cart</span>
              <span>₨ {(calculateTotal() * quantity).toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
