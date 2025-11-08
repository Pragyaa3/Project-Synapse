// components/ContentCard.jsx
'use client';

import { 
  FileText, ShoppingCart, Video, CheckSquare, Quote, 
  Image as ImageIcon, Book, Link, StickyNote, Palette, 
  Code, Mic, Trash2, ExternalLink 
} from 'lucide-react';

const typeIcons = {
  article: FileText,
  product: ShoppingCart,
  video: Video,
  todo: CheckSquare,
  quote: Quote,
  image: ImageIcon,
  book: Book,
  link: Link,
  note: StickyNote,
  design: Palette,
  code: Code,
};

const typeColors = {
  article: 'bg-blue-50 border-blue-200 text-blue-700',
  product: 'bg-green-50 border-green-200 text-green-700',
  video: 'bg-red-50 border-red-200 text-red-700',
  todo: 'bg-purple-50 border-purple-200 text-purple-700',
  quote: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  image: 'bg-pink-50 border-pink-200 text-pink-700',
  book: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  link: 'bg-gray-50 border-gray-200 text-gray-700',
  note: 'bg-orange-50 border-orange-200 text-orange-700',
  design: 'bg-teal-50 border-teal-200 text-teal-700',
  code: 'bg-slate-50 border-slate-200 text-slate-700',
};

export default function ContentCard({ item, onDelete }) {
  const Icon = typeIcons[item.type] || StickyNote;
  const colorClass = typeColors[item.type] || typeColors.note;

  const renderTodoList = () => {
    const todos = item.rawContent.split('\n').filter(line => line.trim());
    return (
      <ul className="space-y-2">
        {todos.slice(0, 5).map((todo, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
            <span className="text-sm">{todo.replace(/^[-*•]\s*/, '')}</span>
          </li>
        ))}
        {todos.length > 5 && (
          <li className="text-sm text-gray-500">+{todos.length - 5} more...</li>
        )}
      </ul>
    );
  };

  const renderProduct = () => (
    <div className="space-y-3">
      {item.metadata.imageUrl && (
        <img 
          src={item.metadata.imageUrl} 
          alt={item.metadata.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}
      <div>
        <h3 className="font-semibold text-lg">{item.metadata.title}</h3>
        {item.metadata.price && (
          <p className="text-2xl font-bold text-green-600 mt-1">
            {item.metadata.price}
          </p>
        )}
        {item.metadata.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
            {item.metadata.description}
          </p>
        )}
      </div>
    </div>
  );

  const renderVideo = () => (
    <div className="space-y-2">
      {item.metadata.imageUrl && (
        <div className="relative">
          <img 
            src={item.metadata.imageUrl} 
            alt={item.metadata.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
            <Video className="w-12 h-12 text-white" />
          </div>
        </div>
      )}
      <h3 className="font-semibold">{item.metadata.title}</h3>
      {item.metadata.description && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {item.metadata.description}
        </p>
      )}
    </div>
  );

  const renderVoiceNote = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-purple-600">
        <Mic className="w-5 h-5" />
        <span className="font-medium">Voice Note</span>
      </div>
      {item.voice?.transcript && (
        <p className="text-sm text-gray-700 italic line-clamp-3">
          "{item.voice.transcript}"
        </p>
      )}
      {item.voice?.tone && (
        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
          {item.voice.tone}
        </span>
      )}
    </div>
  );

  const renderDefault = () => (
    <div className="space-y-2">
      <h3 className="font-semibold line-clamp-2">{item.metadata.title || 'Untitled'}</h3>
      {item.metadata.summary && (
        <p className="text-sm text-gray-600 line-clamp-3">{item.metadata.summary}</p>
      )}
      {item.metadata.author && (
        <p className="text-xs text-gray-500">by {item.metadata.author}</p>
      )}
    </div>
  );

  return (
    <div className={`relative p-4 rounded-lg border-2 ${colorClass} hover:shadow-lg transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="text-xs font-medium uppercase tracking-wider">
            {item.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {item.url && (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button 
            onClick={() => onDelete(item.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        {item.type === 'todo' && renderTodoList()}
        {item.type === 'product' && renderProduct()}
        {item.type === 'video' && renderVideo()}
        {item.voice && renderVoiceNote()}
        {!['todo', 'product', 'video'].includes(item.type) && !item.voice && renderDefault()}
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag, i) => (
            <span 
              key={i}
              className="px-2 py-0.5 bg-white bg-opacity-50 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mt-3">
        {new Date(item.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}