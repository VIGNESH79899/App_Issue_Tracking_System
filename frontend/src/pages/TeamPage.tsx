import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamApi, TeamMemberDTO } from '../services/teamApi';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { AccessLockedCard } from '../components/common/AccessLockedCard';
import { Input } from '../components/common/Input';
import { Mail } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMemberDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadTeam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamApi.getTeamMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || 'Failed to fetch team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const filteredMembers = members.filter((m) => {
    const query = search.toLowerCase();
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      m.projects.some((p) => p.name.toLowerCase().includes(query) || p.key.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Team Members</h1>
          <p className="text-xs text-slate-500 mt-1">
            Engineers, project leads, and reporters assigned to your workspace projects
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader rows={4} height="h-24" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTeam} />
      ) : members.length === 0 ? (
        <AccessLockedCard featureName="Team Workspace" />
      ) : filteredMembers.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
          No team members matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.userId}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center border border-brand-200">
                      {member.firstName?.[0]}
                      {member.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {member.firstName} {member.lastName}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    {member.role}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">
                      Workload Capacity
                    </span>
                    <span className={`font-mono font-bold ${
                      member.activeIssuesCount >= 5
                        ? 'text-rose-600'
                        : member.activeIssuesCount >= 3
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}>
                      {member.activeIssuesCount} issues ({member.activeIssuesCount >= 5 ? 'High' : member.activeIssuesCount >= 3 ? 'Moderate' : 'Optimal'})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        member.activeIssuesCount >= 5
                          ? 'bg-rose-500'
                          : member.activeIssuesCount >= 3
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, (member.activeIssuesCount / 6) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                    Assigned Projects ({member.projects.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.projects.length === 0 ? (
                      <span className="text-slate-400 italic text-[11px]">No projects assigned</span>
                    ) : (
                      member.projects.map((p) => (
                        <span
                          key={p.id}
                          className="bg-brand-50 border border-brand-200 text-brand-700 font-mono text-[11px] px-2 py-0.5 rounded font-semibold"
                        >
                          {p.key}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <Link
                  to={`/issues?assigneeId=${member.userId}`}
                  className="text-brand-600 hover:text-brand-800 font-bold transition-colors"
                >
                  View Assigned Issues →
                </Link>
                <span className="font-mono text-[11px] text-slate-400">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
