import React, { useState } from 'react';
import { Language, Product } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Eye, Share2, MessageSquare, TrendingUp, ArrowUpRight, Award, Info } from 'lucide-react';

interface AnalyticsViewProps {
  language: Language;
  products: Product[];
  onViewProduct: (product: Product) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  language,
  products,
  onViewProduct,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedDay, setSelectedDay] = useState<string>('Thu');

  const daysData = [
    { day: 'Mon', views: 110 },
    { day: 'Tue', views: 185 },
    { day: 'Wed', views: 95 },
    { day: 'Thu', views: 280, isPeak: true },
    { day: 'Fri', views: 155 },
    { day: 'Sat', views: 230 },
    { day: 'Sun', views: 193 },
  ];

  const maxViews = 300;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] font-heading mb-1.5">
          {t.productPerformance}
        </h1>
        <p className="text-sm sm:text-base text-[#534439]">{t.perfSub}</p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Views */}
        <div className="tactile-card rounded-2xl p-5 border border-[#E3E2E0] bg-white flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#534439] uppercase tracking-wider">
              {t.totalViews}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#C6E8F8]/60 text-[#436370] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1A1C1A] font-heading">1,248</span>
            <span className="text-xs font-bold text-[#2A9D8F] flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> ↑ 12%
            </span>
          </div>
        </div>

        {/* WhatsApp Shares */}
        <div className="tactile-card rounded-2xl p-5 border border-[#E3E2E0] bg-white flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#534439] uppercase tracking-wider">
              {t.whatsappShares}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#2A9D8F]/15 text-[#2A9D8F] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1A1C1A] font-heading">342</span>
            <span className="text-xs font-bold text-[#2A9D8F] flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> ↑ 8%
            </span>
          </div>
        </div>

        {/* Inquiries Received */}
        <div className="tactile-card rounded-2xl p-5 border border-[#E3E2E0] bg-white flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#534439] uppercase tracking-wider">
              {t.inquiriesReceived}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FFDCC4]/60 text-[#8E4E14] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1A1C1A] font-heading">56</span>
            <span className="text-xs text-[#765A05] font-semibold">This month</span>
          </div>
        </div>
      </div>

      {/* Views Over Time Chart Container */}
      <div className="tactile-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E3E2E0] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1C1A] font-heading">
              {t.viewsOverTime}
            </h2>
            <p className="text-xs text-[#534439]">Customer impressions from shared WhatsApp and Instagram links</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#FAF9F6] border border-[#E3E2E0] rounded-full text-[#765A05]">
            Last 7 Days
          </span>
        </div>

        {/* Bar Chart Graphics */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-6 px-2 sm:px-6 border-b border-[#E3E2E0]">
          {daysData.map((item) => {
            const heightPercent = Math.round((item.views / maxViews) * 100);
            const isSelected = selectedDay === item.day;

            return (
              <div
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Views tooltips on hover or selected */}
                <div
                  className={`text-[11px] font-bold mb-2 transition-all ${
                    item.isPeak ? 'text-[#8E4E14]' : 'text-[#534439]'
                  }`}
                >
                  {item.views}
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[48px] bg-[#FAF9F6] rounded-t-xl overflow-hidden flex items-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      item.isPeak
                        ? 'bg-[#F4A261] group-hover:bg-[#E76F51]'
                        : 'bg-[#C6E8F8] group-hover:bg-[#ABCEDB]'
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-xs mt-3 font-semibold transition-colors ${
                    isSelected ? 'text-[#8E4E14] font-bold' : 'text-[#867468]'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Products Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1C1A] font-heading flex items-center gap-2">
            <Award className="w-5 h-5 text-[#8E4E14]" />
            <span>{t.topPerforming}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.slice(0, 4).map((prod) => (
            <div
              key={prod.id}
              className="tactile-card rounded-2xl p-4 bg-white border border-[#E3E2E0] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={prod.imageUrl}
                  alt={prod.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#1A1C1A] font-heading truncate">
                    {prod.title}
                  </h4>
                  <p className="text-xs text-[#534439] truncate">{prod.category}</p>
                  <span className="text-xs text-[#765A05] font-semibold flex items-center gap-1 mt-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{prod.views} views • {prod.shares} shares</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewProduct(prod)}
                className="py-1.5 px-3.5 rounded-full border border-[#D8C2B5] hover:border-[#8E4E14] text-xs font-semibold text-[#1A1C1A] hover:text-[#8E4E14] hover:bg-[#FFDCC4]/20 transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#8E4E14]" />
                <span>{language === 'hi' ? 'शेयर व डाउनलोड' : 'Share & Export'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
