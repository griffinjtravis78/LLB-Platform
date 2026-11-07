// File: src/modules/module13.js
import { supabase } from '../app.js';

export async function renderDashboard(container) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-[#D8C3A5]/20 pb-4">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 13: Historical Storytelling & Memorial Speeches</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog historical narratives, biographical anecdotes, memorial speech assignments, and speaker transcripts.</p>
                </div>
                <button id="btn-add-story" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Story Record (13.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Stories & Speech Assignments
                </div>
                <div id="stories-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-story').addEventListener('click', () => {
        window.app.activeSubLevel = '13.1';
        window.app.renderNavigation();
        window.app.loadModule('module13', '13.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_13_stories')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('stories-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No historical stories or speeches entered yet. Click "+ Add Story Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Story / Speech Title</th>
                    <th class="p-2.5">Assigned Speaker</th>
                    <th class="p-2.5">Category</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.story_title || 'N/A'}</td>
                        <td class="p-2.5">${rec.assigned_speaker || 'Open / Unassigned'}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D8C3A5]/20 text-[#D8C3A5] border border-[#D8C3A5]/40">${rec.story_category || 'General'}</span></td>
                        <td class="p-2.5 text-right space-x-2">
                            <button data-id="${rec.id}" class="edit-btn text-[#D8C3A5] hover:underline font-bold bg-transparent border-none cursor-pointer">EDIT</button>
                            <button data-id="${rec.id}" class="delete-btn text-red-300 hover:underline font-bold bg-transparent border-none cursor-pointer">DELETE</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this story record?')) {
                const { error: delError } = await supabase.from('module_13_stories').delete().eq('id', id);
                if (delError) {
                    alert(`Error deleting record: ${delError.message}`);
                } else {
                    loadRecordsTable(tenantId);
                }
            }
        });
    });

    tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.app.activeSubLevel = '13.1';
            window.app.renderNavigation();
            window.app.loadModule('module13', '13.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '13.1') {
        renderStoryForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderStoryForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 13.1: Historical Story & Speech Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record narrative content and assign memorial speakers. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod13-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Story / Speech Title *</label>
                    <input type="text" id="story_title" placeholder="e.g. Tales of Little Turtle's Journeys" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Story Category *</label>
                        <select id="story_category" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                            <option value="">Select Category...</option>
                            <option value="Memorial Eulogy">Memorial Eulogy</option>
                            <option value="Biographical Anecdote">Biographical Anecdote</option>
                            <option value="Historical Fiction Narrative">Historical Fiction Narrative</option>
                            <option value="Children's Story Series">Children's Story Series</option>
                            <option value="Family Legacy Reflection">Family Legacy Reflection</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Assigned Speaker / Reader</label>
                        <input type="text" id="assigned_speaker" placeholder="Name from Module 11" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Narrative Content / Speech Transcript *</label>
                    <textarea id="narrative_content" placeholder="Enter full text, speech transcript, or historical story summary..." rows="5" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Story Record</button>
            </form>
            <div id="mod13-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module13', null);
    });

    document.getElementById('mod13-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const story_title = document.getElementById('story_title').value.trim();
        const story_category = document.getElementById('story_category').value;
        const assigned_speaker = document.getElementById('assigned_speaker').value.trim();
        const narrative_content = document.getElementById('narrative_content').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod13-status');
        statusEl.textContent = 'Saving story record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_13_stories').insert({
            tenant_id: profile.tenant_id,
            story_title,
            story_category,
            assigned_speaker: assigned_speaker || null,
            narrative_content
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved historical story record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module13', null);
            }, 1000);
        }
    });
}
