import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock,
  Share2, Flag, CheckCircle2, Clock3, AlertCircle, XCircle,
} from 'lucide-react';
import Badge, { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

const MOCK_COMPLAINT = {
  _id: '1',
  title: 'Giant pothole on MG Road near bus stop causing accidents',
  description: `There is a massive pothole measuring approximately 3 feet wide and 6 inches deep near the City Bus Stop 12 on MG Road. This pothole has been present for over two weeks now and has caused multiple two-wheeler accidents. Residents in the area are extremely concerned about their safety.\n\nThe pothole appears to have developed due to recent rain and poor road quality. Multiple vehicles have already suffered tyre damage. The area is heavily trafficked and is near a school zone.`,
  category: 'roads', status: 'in_progress', priority: 'high',
  upvotes: 128, downvotes: 4, commentCount: 23,
  location: { address: 'MG Road, near Bus Stop 12', pincode: '560001', ward: 'Ward 47', city: 'Bengaluru' },
  reportedBy: { name: 'Priya Sharma', avatar: null },
  assignedTo: { name: 'Roads & Infrastructure Dept.' },
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  images: [],
  isVerified: false,
};

const STATUS_TIMELINE = [
  { status: 'open',        label: 'Reported',    date: '2 hours ago',  done: true  },
  { status: 'acknowledged',label: 'Acknowledged', date: '1 hour ago',   done: true  },
  { status: 'in_progress', label: 'In Progress',  date: '30 mins ago',  done: true  },
  { status: 'resolved',    label: 'Resolved',     date: 'Pending',      done: false },
];

const MOCK_COMMENTS = [
  { _id: 'c1', author: { name: 'Ravi Kumar', role: 'citizen' }, content: 'I also witnessed an accident here yesterday. This needs immediate fixing!', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), isOfficialUpdate: false },
  { _id: 'c2', author: { name: 'Roads Dept. Officer', role: 'municipal_officer' }, content: 'We have received your complaint and a site inspection has been scheduled for tomorrow morning. Work order has been issued.', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), isOfficialUpdate: true },
  { _id: 'c3', author: { name: 'Meena S.', role: 'citizen' }, content: 'Thank you for the quick response! We really appreciate it.', createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), isOfficialUpdate: false },
];

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [upvoted, setUpvoted] = useState(false);
  const [votes, setVotes] = useState(MOCK_COMPLAINT.upvotes - MOCK_COMPLAINT.downvotes);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [submitting, setSubmitting] = useState(false);

  const handleUpvote = () => {
    if (upvoted) { setUpvoted(false); setVotes((v) => v - 1); }
    else { setUpvoted(true); setVotes((v) => v + 1); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setComments((c) => [...c, {
      _id: String(Date.now()),
      author: { name: 'You', role: 'citizen' },
      content: comment,
      createdAt: new Date().toISOString(),
      isOfficialUpdate: false,
    }]);
    setComment('');
    setSubmitting(false);
    toast.success('Comment posted!');
  };

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm text-secondary-400 hover:text-primary-600 mb-4 no-underline transition-colors">
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <CategoryBadge category={MOCK_COMPLAINT.category} />
          <StatusBadge status={MOCK_COMPLAINT.status} />
          <PriorityBadge priority={MOCK_COMPLAINT.priority} />
        </div>
        <h1 className="text-lg font-bold text-secondary-900 leading-snug">{MOCK_COMPLAINT.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-secondary-400">
          <span className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-[9px] text-primary-700 font-bold">{MOCK_COMPLAINT.reportedBy.name.charAt(0)}</span>
            </div>
            {MOCK_COMPLAINT.reportedBy.name}
          </span>
          <span className="flex items-center gap-0.5"><Clock size={10} />{timeAgo(MOCK_COMPLAINT.createdAt)}</span>
          <span className="flex items-center gap-0.5"><MapPin size={10} />{MOCK_COMPLAINT.location.address}</span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-surface border border-secondary-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-secondary-600 whitespace-pre-line leading-relaxed">
          {MOCK_COMPLAINT.description}
        </p>
      </div>

      {/* Vote + Share */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-all min-h-[44px]
            ${upvoted ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-surface border-secondary-200 text-secondary-600 hover:border-primary-300'}`}
        >
          <ThumbsUp size={15} fill={upvoted ? 'currentColor' : 'none'} />
          {votes} Support
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm text-secondary-500 border border-secondary-200 bg-surface hover:bg-secondary-50 transition-colors min-h-[44px]">
          <Share2 size={14} />
          Share
        </button>
      </div>

      {/* Status Timeline */}
      <div className="bg-surface border border-secondary-200 rounded-lg p-4 mb-4">
        <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3">Progress</h3>
        <div className="relative">
          {STATUS_TIMELINE.map((step, i) => (
            <div key={step.status} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-primary-600' : 'bg-secondary-200'}`}>
                  {step.done ? <CheckCircle2 size={12} className="text-white" /> : <Clock3 size={10} className="text-secondary-400" />}
                </div>
                {i < STATUS_TIMELINE.length - 1 && (
                  <div className={`w-px h-6 mt-0.5 ${step.done ? 'bg-primary-200' : 'bg-secondary-100'}`} />
                )}
              </div>
              <div className="pb-1">
                <p className={`text-xs font-semibold ${step.done ? 'text-secondary-800' : 'text-secondary-400'}`}>{step.label}</p>
                <p className="text-[10px] text-secondary-400">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned dept */}
      {MOCK_COMPLAINT.assignedTo && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
          <AlertCircle size={14} className="text-primary-600 flex-shrink-0" />
          <p className="text-xs text-primary-700">
            Assigned to <strong>{MOCK_COMPLAINT.assignedTo.name}</strong>
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
          <MessageCircle size={15} />
          Comments ({comments.length})
        </h3>
        <div className="space-y-3 mb-4">
          {comments.map((c) => (
            <div
              key={c._id}
              className={`p-3 rounded-lg border text-sm ${c.isOfficialUpdate ? 'bg-blue-50 border-blue-100' : 'bg-surface border-secondary-200'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${c.isOfficialUpdate ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'}`}>
                  {c.author.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-secondary-700">{c.author.name}</span>
                {c.isOfficialUpdate && (
                  <span className="px-1.5 py-0.5 bg-primary-600 text-white text-[9px] font-bold rounded-full">OFFICIAL</span>
                )}
                <span className="text-[10px] text-secondary-400 ml-auto">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-xs text-secondary-600 leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>

        {/* Comment form */}
        <form onSubmit={handleComment}>
          <Textarea
            placeholder="Add a comment or update..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            id="complaint-comment"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            className="mt-2"
            disabled={!comment.trim()}
          >
            Post Comment
          </Button>
        </form>
      </div>
    </div>
  );
}
