// File: src/components/legalDisclaimer.js
export function renderLegalDisclaimerModal(onAccept) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'legal-modal-overlay';
    modalOverlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    
    modalOverlay.innerHTML = `
        <div class="bg-[#2C353D] border border-[#D8C3A5]/40 p-8 rounded-lg max-w-lg w-full shadow-2xl space-y-4">
            <div class="flex items-center gap-3 border-b border-[#D8C3A5]/20 pb-4">
                <div class="w-8 h-8 rounded bg-[#D8C3A5] flex items-center justify-center font-bold text-[#2C353D] text-xs">LLB</div>
                <h2 class="text-lg font-bold text-[#D8C3A5]">Legal & UPL Notice</h2>
            </div>
            <div class="text-xs text-gray-200 space-y-3 leading-relaxed bg-[#485664] p-4 rounded border border-[#6A7B8C]/40 max-h-60 overflow-y-auto">
                <p><strong>Notice of Operational Scope:</strong> The LLB (Life, Legacy, and Bereavement) platform is a secure enterprise estate workflow and operational ERP system developed and operated by Griffin Property and Holdings LLC (Griffin Consulting).</p>
                <p><strong>Not Legal Representation:</strong> LLB is an administrative tracking tool and workflow organizer. It does not provide formal legal representation, draft binding testamentary instruments without licensed counsel review, or engage in the unauthorized practice of law (UPL).</p>
                <p>Users are strongly advised to retain licensed legal counsel (such as the primary attorney recorded in Module 1) to validate all estate, trust, and probate execution documents.</p>
            </div>
            <div class="flex items-center gap-2 pt-2">
                <input type="checkbox" id="accept-upl" class="accent-[#D8C3A5] rounded bg-[#485664] border-[#6A7B8C] text-[#D8C3A5] focus:ring-0 w-4 h-4 cursor-pointer" />
                <label for="accept-upl" class="text-xs text-gray-200 cursor-pointer">I acknowledge and accept these operational terms *</label>
            </div>
            <button id="btn-accept-upl" disabled class="w-full bg-[#6A7B8C] text-gray-300 font-bold py-2.5 rounded transition cursor-not-allowed text-xs uppercase tracking-wider">Proceed to Master Dashboard</button>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    const checkbox = modalOverlay.querySelector('#accept-upl');
    const acceptBtn = modalOverlay.querySelector('#btn-accept-upl');

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            acceptBtn.disabled = false;
            acceptBtn.className = 'w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow';
        } else {
            acceptBtn.disabled = true;
            acceptBtn.className = 'w-full bg-[#6A7B8C] text-gray-300 font-bold py-2.5 rounded transition cursor-not-allowed text-xs uppercase tracking-wider';
        }
    });

    acceptBtn.addEventListener('click', () => {
        modalOverlay.remove();
        if (onAccept) onAccept();
    });
}
