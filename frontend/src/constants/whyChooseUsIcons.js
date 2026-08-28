/**
 * Shared icon catalogue for Why Choose Us.
 * Used by both the dashboard picker and the public landing section.
 * Always uses static named imports — never dynamic lookups.
 */
import {
  Star, BadgeCheck, BadgeDollarSign, Zap, Settings2, Wrench,
  ShieldCheck, Headphones, Construction, Truck, Clock, Award,
  Users, Globe, Lightbulb, Heart, Leaf, BarChart2, Package,
  Phone, CheckCircle, ThumbsUp, Layers, Cpu, Hammer,
  Wind, MapPin, FileText,
  ChefHat, Factory, Warehouse, ShoppingBag, Hospital,
  GraduationCap, Car, Building2, Utensils, Building,
} from 'lucide-react';

export const ICON_LIST = [
  { name: 'BadgeCheck',      Comp: BadgeCheck },
  { name: 'BadgeDollarSign', Comp: BadgeDollarSign },
  { name: 'Zap',             Comp: Zap },
  { name: 'Settings2',       Comp: Settings2 },
  { name: 'Wrench',          Comp: Wrench },
  { name: 'ShieldCheck',     Comp: ShieldCheck },
  { name: 'Headphones',      Comp: Headphones },
  { name: 'Construction',    Comp: Construction },
  { name: 'Truck',           Comp: Truck },
  { name: 'Clock',           Comp: Clock },
  { name: 'Award',           Comp: Award },
  { name: 'Users',           Comp: Users },
  { name: 'Globe',           Comp: Globe },
  { name: 'Lightbulb',       Comp: Lightbulb },
  { name: 'Heart',           Comp: Heart },
  { name: 'Leaf',            Comp: Leaf },
  { name: 'BarChart2',       Comp: BarChart2 },
  { name: 'Package',         Comp: Package },
  { name: 'Phone',           Comp: Phone },
  { name: 'CheckCircle',     Comp: CheckCircle },
  { name: 'ThumbsUp',        Comp: ThumbsUp },
  { name: 'Layers',          Comp: Layers },
  { name: 'Cpu',             Comp: Cpu },
  { name: 'Hammer',          Comp: Hammer },
  { name: 'Wind',            Comp: Wind },
  { name: 'MapPin',          Comp: MapPin },
  { name: 'FileText',        Comp: FileText },
  { name: 'ChefHat',         Comp: ChefHat },
  { name: 'Factory',         Comp: Factory },
  { name: 'Warehouse',       Comp: Warehouse },
  { name: 'ShoppingBag',     Comp: ShoppingBag },
  { name: 'Hospital',        Comp: Hospital },
  { name: 'GraduationCap',   Comp: GraduationCap },
  { name: 'Car',             Comp: Car },
  { name: 'Building2',       Comp: Building2 },
  { name: 'Utensils',        Comp: Utensils },
  { name: 'Building',        Comp: Building },
  { name: 'Star',            Comp: Star },
];

/** Resolve an icon name → component, falling back to Star */
export const getIconComp = (name) =>
  ICON_LIST.find((i) => i.name === name)?.Comp ?? Star;
