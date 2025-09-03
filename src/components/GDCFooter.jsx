import React from 'react';
import { ExternalLink, MapPin, Phone, Mail, Clock, Shield, AlertCircle, Calendar } from 'lucide-react';

const GDCFooter = () => {
  const currentYear = new Date()?.getFullYear();
  const lastUpdated = '3rd September 2025'; // Update this when making changes

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* GDC Compliance Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">General Dental Council (GDC) Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Practice Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Practice Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Postinos Dental Practice</div>
                    <div>123 High Street</div>
                    <div>London, SW1A 1AA</div>
                    <div>United Kingdom</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>020 7123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>info@postinosdental.co.uk</span>
                </div>
              </div>
            </div>

            {/* Principal Dentist Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Principal Dentist</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Dr. Sarah Johnson BDS MFDS RCS(Ed)</strong></p>
                <p><strong>GDC Registration:</strong> 123456</p>
                <p><strong>Qualified:</strong> King's College London (2015)</p>
                <p><strong>Special Interest:</strong> Cosmetic & Restorative Dentistry</p>
                <p><strong>Additional Qualifications:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Certificate in Oral Implantology</li>
                  <li>Diploma in Conscious Sedation</li>
                </ul>
              </div>
            </div>

            {/* Operating Hours & Services */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Opening Hours & Services</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <div><strong>Monday-Friday:</strong> 8:00 AM - 6:00 PM</div>
                    <div><strong>Saturday:</strong> 9:00 AM - 2:00 PM</div>
                    <div><strong>Sunday:</strong> Closed</div>
                    <div className="text-red-600 font-medium mt-2">Emergency: 24/7 On-Call</div>
                  </div>
                </div>
                <div>
                  <strong>Services Available:</strong>
                  <div className="mt-1">NHS & Private treatments</div>
                  <div>Emergency appointments</div>
                  <div>Specialist referrals available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional GDC Required Information */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Practice Team GDC Numbers</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Dr. Sarah Johnson (Principal): GDC 123456</div>
                  <div>Dr. Michael Chen (Associate): GDC 234567</div>
                  <div>Emma Wilson (Dental Hygienist): GDC 345678</div>
                  <div>James Parker (Dental Therapist): GDC 456789</div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Practice Registration</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Care Quality Commission:</strong> 1-000000001</div>
                  <div><strong>Data Controller Registration:</strong> Z1234567</div>
                  <div><strong>NHS Contract Number:</strong> 14A/2023/004</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory and Compliance Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Regulation & Standards</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.gdc-uk.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  General Dental Council <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.cqc.org.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Care Quality Commission <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="/gdc-standards"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Standards for the Dental Team
                </a>
              </li>
              <li>
                <a
                  href="/infection-control"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Infection Control Procedures
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/complaints-procedure" className="text-blue-600 hover:text-blue-700">
                  Complaints Procedure
                </a>
              </li>
              <li>
                <a href="/patient-charter" className="text-blue-600 hover:text-blue-700">
                  Patient Charter & Rights
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/treatment-options" className="text-blue-600 hover:text-blue-700">
                  Treatment Options & Costs
                </a>
              </li>
              <li>
                <a href="/consent-forms" className="text-blue-600 hover:text-blue-700">
                  Consent Forms & Information
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Emergency & Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/emergency-appointments" className="text-blue-600 hover:text-blue-700">
                  Emergency Appointments
                </a>
              </li>
              <li>
                <a href="/out-of-hours" className="text-blue-600 hover:text-blue-700">
                  Out of Hours Care
                </a>
              </li>
              <li>
                <a
                  href="https://www.nhs.uk/using-the-nhs/nhs-services/urgent-and-emergency-care/when-to-visit-accident-and-emergency/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  NHS Emergency Services <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="/accessibility" className="text-blue-600 hover:text-blue-700">
                  Accessibility Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Professional Development</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/team" className="text-blue-600 hover:text-blue-700">
                  Meet Our Team
                </a>
              </li>
              <li>
                <a href="/continuing-education" className="text-blue-600 hover:text-blue-700">
                  Continuing Professional Development
                </a>
              </li>
              <li>
                <a href="/clinical-governance" className="text-blue-600 hover:text-blue-700">
                  Clinical Governance
                </a>
              </li>
              <li>
                <a href="/quality-assurance" className="text-blue-600 hover:text-blue-700">
                  Quality Assurance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Complaints Process */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Complaints Process</h4>
              <p className="text-sm text-yellow-700 mb-3">
                We are committed to providing high-quality dental care. If you have concerns about your treatment, 
                please contact our practice manager first. We follow a structured complaints procedure in accordance 
                with GDC standards. If your complaint cannot be resolved locally, you may contact:
              </p>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• <strong>Practice Manager:</strong> complaints@postinosdental.co.uk or 020 7123 4567</li>
                <li>• <strong>GDC Complaints:</strong> <a href="https://www.gdc-uk.org" className="underline">gdc-uk.org</a> or 020 7167 6000</li>
                <li>• <strong>CQC Complaints:</strong> <a href="https://www.cqc.org.uk" className="underline">cqc.org.uk</a> or 03000 616161</li>
                <li>• <strong>NHS Complaints:</strong> Contact NHS England at 0300 311 22 33</li>
                <li>• <strong>Ombudsman:</strong> Parliamentary and Health Service Ombudsman (final stage)</li>
                <li>• <strong>Dental Protection:</strong> For treatment-related disputes</li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                <strong>Response Times:</strong> We aim to acknowledge complaints within 3 working days 
                and provide a full response within 10 working days.
              </div>
            </div>
          </div>
        </div>

        {/* Website Last Updated */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <strong className="text-blue-800">Website Last Updated:</strong> 
              <span className="text-blue-700 ml-2">{lastUpdated}</span>
            </div>
          </div>
          <div className="text-xs text-blue-600 mt-2">
            This website is regularly updated to ensure compliance with GDC guidance and current regulations.
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="text-sm text-gray-600">
              <div>© {currentYear} Postinos Dental Practice. All rights reserved.</div>
              <div className="mt-1">
                <span className="font-medium">Principal:</span> Dr. Sarah Johnson BDS MFDS RCS(Ed) | 
                <span className="font-medium"> GDC Registration:</span> 123456 | 
                <span className="font-medium"> CQC Registration:</span> 1-000000001
              </div>
              <div className="mt-1 text-xs">
                Registered in England and Wales. Company Number: 12345678
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/terms" className="text-blue-600 hover:text-blue-700">
                Terms & Conditions
              </a>
              <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </a>
              <a href="/cookies" className="text-blue-600 hover:text-blue-700">
                Cookie Policy
              </a>
              <a href="/ai-policy" className="text-blue-600 hover:text-blue-700">
                AI Usage Policy
              </a>
              <a href="/accessibility" className="text-blue-600 hover:text-blue-700">
                Accessibility
              </a>
              <a href="/sitemap.xml" className="text-blue-600 hover:text-blue-700">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GDCFooter;