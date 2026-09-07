import React, { useState, useEffect } from 'react';
import { UserDTO, UserRole, SmartAssigneeRecommendation } from '@app-issue-track/shared';
import { usersApi } from '../../services/usersApi';
import { routingApi } from '../../services/routingApi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SearchBar } from '../common/SearchBar';
import { UserX, Loader2, Sparkles, Check, ChevronRight } from 'lucide-react';

export interface AssigneeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId?: string;
  currentAssigneeId?: string | null;
  onAssign: (userId: string | null) => Promise<void>;
}

export const AssigneeSelectorModal: React.FC<AssigneeSelectorModalProps> = ({
  isOpen,
  onClose,
  issueId,
  currentAssigneeId,
  onAssign,
}) => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [recommendations, setRecommendations] = useState<SmartAssigneeRecommendation[]>([]);
  const [search, setSearch] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingUsers(true);
      usersApi
        .getUsers()
        .then((data) =>
          setUsers(
            data.filter(
              (u) =>
                u.isActive &&
                (u.role === UserRole.DEVELOPER || u.role === UserRole.ADMIN || u.role === UserRole.PROJECT_MANAGER)
            )
          )
        )
        .catch(() => {})
        .finally(() => setIsLoadingUsers(false));

      if (issueId) {
        setIsLoadingRecs(true);
        routingApi
          .getSmartAssigneeRecommendations(issueId)
          .then((recs) => setRecommendations(recs))
          .catch(() => setRecommendations([]))
          .finally(() => setIsLoadingRecs(false));
      }
    }
  }, [isOpen, issueId]);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = async (userId: string | null) => {
    setIsSubmitting(true);
    try {
      await onAssign(userId);
      onClose();
    } catch {
      // Handled by parent error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Issue to Developer" maxWidth="lg">
      <div className="space-y-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search developer by name or email..." />

        {currentAssigneeId && (
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md">
            <span className="text-xs text-amber-800 font-medium">Issue is currently assigned.</span>
            <Button
              variant="outline"
              size="sm"
              isLoading={isSubmitting}
              onClick={() => handleSelect(null)}
              leftIcon={<UserX className="w-3.5 h-3.5" />}
            >
              Unassign
            </Button>
          </div>
        )}

        {/* Smart Issue Routing Recommendations Section */}
        {issueId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Smart Recommendations</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Deterministic Match Engine</span>
            </div>

            {isLoadingRecs ? (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600 mx-auto" />
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded border border-slate-200">
                No active project developers found for smart recommendations.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {recommendations.map((rec) => {
                  const isSelected = rec.userId === currentAssigneeId;
                  return (
                    <div
                      key={rec.userId}
                      className={`p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-subtle'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs">{rec.userName}</span>
                            <span className="bg-brand-100 text-brand-700 font-mono font-bold text-[11px] px-2 py-0.2 rounded">
                              {rec.score}% Match
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                              {rec.projectRole}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {rec.activeIssueCount} active issues · {rec.criticalHighIssueCount} critical/high
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant={isSelected ? 'primary' : 'outline'}
                          isLoading={isSubmitting}
                          onClick={() => handleSelect(rec.userId)}
                          rightIcon={isSelected ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        >
                          {isSelected ? 'Assigned' : 'Assign'}
                        </Button>
                      </div>

                      {/* Recommendation Reasons */}
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider block">
                          Why recommended:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                          {rec.reasons.map((r, idx) => (
                            <li key={idx} className="leading-tight">
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* All Available Developers Section */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">All Active Developers</span>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md">
            {isLoadingUsers ? (
              <div className="p-6 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600 mx-auto" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No active developers found</div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = u.id === currentAssigneeId;
                return (
                  <div
                    key={u.id}
                    onClick={() => !isSubmitting && handleSelect(u.id)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-brand-50/50 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {u.firstName?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
