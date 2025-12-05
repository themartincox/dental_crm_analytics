import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Database, Lock, Eye, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AIUsagePolicy = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth..getSession();
        if (session?.user) {
          setIsLoggedIn(true);
          // Get user role from user_profiles
          const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', session?.user?.id).single();
          
          setUserRole(profile?.role);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuthStatus();
  }, []);

  // Log policy view event when component mounts and user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      logAIUsageEvent('ai_policy_viewed', {
        action: 'policy_document_accessed',
        userRole: userRole,
        containsHealthData: false,
        policySection: 'full_document'
      });
    }
  }, [isLoggedIn, userRole]);

  const logAIUsageEvent = async (eventType, details) => {
    if (!isLoggedIn) return;

    try {
      const { data: { user } } = await supabase.auth..getUser();
      if (!user) return;

      // Log to security audit logs
      await supabase.from('security_audit_logs').insert({
          action: eventType,
          resource_type: 'ai_usage',
          resource_id: user?.id,
          metadata: {
            .details,
            timestamp: new Date().toISOString(),
            policyVersion: '1.0',
            gdprCompliance: true,
            dataMinimization: true
          },
          success: true,
          risk_level: details?.containsHealthData ? 'high' : 'low'
        });

    } catch (error) {
      console.error('Error logging AI usage:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Usage Policy</h1>
          <p className="text-gray-600">Data Protection & GDPR Compliance Guidelines</p>
        </div>
      </div>

      {/* Policy Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Policy Overview</h2>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-blue-800">
            This policy governs the use of Artificial Intelligence (AI) systems within our dental practice 
            to ensure compliance with GDPR, Data Protection Act 2018, and GDC guidelines regarding patient 
            data processing and special category health data.
          </p>
        </div>
      </div>

      {/* Critical Data Protection Rules */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">Critical Data Protection Rules</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="font-semibold text-red-800 mb-2">PROHIBITED ACTIONS</h3>
            <ul className="text-red-700 text-sm space-y-2">
              <li>• Sending patient names to external AI services</li>
              <li>• Processing NHS numbers through third-party AI</li>
              <li>• Sharing treatment history with LLM providers</li>
              <li>• Using patient photos in AI without explicit consent</li>
              <li>• Transmitting special category health data to OpenAI/Google</li>
              <li>• Allowing AI model training on patient data</li>
            </ul>
          </div>
          
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">PERMITTED ACTIONS</h3>
            <ul className="text-green-700 text-sm space-y-2">
              <li>• Processing anonymized appointment statistics</li>
              <li>• Using AI for administrative task automation</li>
              <li>• Analyzing aggregated non-health data trends</li>
              <li>• AI-powered appointment scheduling (no clinical data)</li>
              <li>• Marketing content generation (non-patient data)</li>
              <li>• Staff training content development</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Processing Safeguards */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Data Processing Safeguards</h2>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Data Minimization Protocol</h3>
            <div className="text-gray-700 text-sm space-y-2">
              <p><strong>Before AI Processing:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Remove all direct identifiers (name, address, phone, email)</li>
                <li>Strip NHS numbers and patient reference codes</li>
                <li>Anonymize location data and practice identifiers</li>
                <li>Replace dates with relative time periods</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Technical Safeguards</h3>
            <div className="text-gray-700 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Encryption Requirements:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>End-to-end encryption in transit</li>
                    <li>AES-256 encryption at rest</li>
                    <li>Encrypted API communications only</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Access Controls:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Role-based access permissions</li>
                    <li>Multi-factor authentication</li>
                    <li>Audit trail for all AI interactions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approved AI Use Cases */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Approved AI Use Cases</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">Administrative AI</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Appointment scheduling optimization</li>
              <li>• Email template generation</li>
              <li>• Practice performance analytics</li>
              <li>• Resource planning assistance</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">Marketing AI</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Content creation for website</li>
              <li>• SEO optimization suggestions</li>
              <li>• Social media post generation</li>
              <li>• Campaign performance analysis</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">Training & Education</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Staff training materials</li>
              <li>• Patient education content</li>
              <li>• Procedure documentation</li>
              <li>• Compliance check assistance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Compliance Framework */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Legal Compliance Framework</h2>
        </div>

        <div className="border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">GDPR Article 9 Compliance</h3>
              <div className="text-gray-700 text-sm space-y-2">
                <p><strong>Special Category Data Processing:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Explicit consent required for health data AI processing</li>
                  <li>Data Processing Impact Assessment (DPIA) completed</li>
                  <li>Lawful basis documented for each AI use case</li>
                  <li>Right to withdraw consent implemented</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">GDC Standards Compliance</h3>
              <div className="text-gray-700 text-sm space-y-2">
                <p><strong>Professional Standards:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Patient confidentiality maintained at all times</li>
                  <li>Clinical judgement remains with qualified professionals</li>
                  <li>AI outputs verified by clinical staff</li>
                  <li>Patient records remain under practice control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Processing Agreements */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Third-Party AI Service Requirements</h2>
        </div>

        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
          <h3 className="font-semibold text-orange-800 mb-2">Mandatory Contractual Requirements</h3>
          <div className="text-orange-700 text-sm space-y-2">
            <p>Before using any external AI service, ensure the following contractual protections:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Data Residency:</strong> All processing within UK/EU jurisdiction</li>
              <li><strong>Model Training Prohibition:</strong> No use of our data for AI model training</li>
              <li><strong>Data Deletion Rights:</strong> Right to delete all data on demand</li>
              <li><strong>Security Standards:</strong> ISO 27001 or equivalent certification</li>
              <li><strong>Incident Reporting:</strong> 24-hour breach notification requirement</li>
              <li><strong>Audit Rights:</strong> Right to audit data processing activities</li>
              <li><strong>GDPR Compliance:</strong> Full GDPR Article 28 processor obligations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Incident Response */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Data Incident Response</h2>
        
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h3 className="font-semibold text-red-800 mb-2">If Patient Data Is Accidentally Sent to AI:</h3>
          <ol className="text-red-700 text-sm space-y-2 list-decimal list-inside">
            <li>Immediately stop the AI processing</li>
            <li>Contact the AI service provider to request data deletion</li>
            <li>Document the incident with timestamps and affected data</li>
            <li>Notify the Data Protection Officer within 1 hour</li>
            <li>Consider ICO notification if high risk to patients</li>
            <li>Review and update procedures to prevent recurrence</li>
            <li>Conduct staff retraining if necessary</li>
          </ol>
        </div>
      </div>

      {/* Staff Responsibilities */}
      {isLoggedIn && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Responsibilities</h2>
          
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 mb-2">
              As a {userRole || 'staff member'}, you must:
            </h3>
            <ul className="text-blue-700 text-sm space-y-2 list-disc list-inside">
              <li>Complete annual AI and data protection training</li>
              <li>Report any suspected AI data breaches immediately</li>
              <li>Verify AI outputs before clinical use</li>
              <li>Never process patient data through unauthorized AI tools</li>
              <li>Maintain patient confidentiality in all AI interactions</li>
              <li>Follow the data minimization protocols before AI processing</li>
            </ul>
            
            {(userRole === 'super_admin' || userRole === 'practice_admin') && (
              <div className="mt-4 p-3 bg-yellow-100 rounded">
                <p className="text-yellow-800 text-sm font-medium">
                  <strong>Admin Additional Responsibilities:</strong>
                </p>
                <ul className="text-yellow-700 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>Review AI usage logs monthly</li>
                  <li>Update Data Processing Impact Assessments annually</li>
                  <li>Maintain contracts with AI service providers</li>
                  <li>Coordinate AI incident response procedures</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Policy Enforcement */}
      <div className="border-t pt-6">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>Policy Version:</strong> 1.0 | 
            <strong> Effective Date:</strong> 3rd September 2025 | 
            <strong> Next Review:</strong> March 2026
          </p>
          <p>
            This policy is binding for all staff members and contractors. 
            Violations may result in disciplinary action and regulatory reporting.
          </p>
          <p className="mt-2">
            For questions, contact our Data Protection Officer at{' '}
            <a href="mailto:dpo@postinosdental.co.uk" className="text-blue-600 hover:underline">
              dpo@postinosdental.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIUsagePolicy;