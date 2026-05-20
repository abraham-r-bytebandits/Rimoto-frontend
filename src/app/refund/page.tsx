import { useState } from 'react';
import { UserNavbar } from '@/components/layout/UserNavbar';
import Footer from '@/components/layout/Footer';
import { Form, Input, Select, DatePicker, Upload, Checkbox, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1', withCredentials: true });

const { TextArea } = Input;
const { Option } = Select;

const colors = ["Black", "White", "Red", "Blue", "Green", "Grey", "Brown"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function RefundPage() {
  const [claimType, setClaimType] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append non-file fields
      Object.keys(values).forEach(key => {
        if (key !== 'invoice' && key !== 'productMedia' && values[key] !== undefined) {
          if (key === 'purchaseDate') {
            formData.append(key, values[key].toISOString());
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Append files
      if (values.invoice?.[0]?.originFileObj) {
        formData.append('invoice', values.invoice[0].originFileObj);
      }
      
      if (values.productMedia && values.productMedia.length > 0) {
        values.productMedia.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('productMedia', file.originFileObj);
          }
        });
      }

      await api.post('/public/claims', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      message.error(error.response?.data?.error || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    maxCount: 1,
  };

  const multiUploadProps = {
    beforeUpload: () => false,
    maxCount: 10,
    multiple: true,
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg font-sans">
      <UserNavbar activePath="/refund" />
      
      <main className="flex-1 flex flex-col items-center py-16 px-4 sm:px-8">
        <div className="w-full max-w-3xl bg-white border border-black p-6 sm:p-10 shadow-[8px_8px_0_var(--color-accent)]">
          <h1 className="font-display text-4xl uppercase tracking-widest text-black mb-8 border-b-2 border-black pb-4 text-center">
            Rimoto Gear Claims
          </h1>

          {isSubmitted ? (
            <div className="text-center py-12 animate-in fade-in duration-500">
              <h2 className="font-display text-2xl uppercase tracking-widest text-black mb-4">Success</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-[14px]">
                Thanks for filling up the form. Our team member will be in touch with you shortly.
              </p>
              <div className="bg-gray-100 p-6 border border-gray-300 inline-block text-left shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-black mb-3">If you have any more queries/concerns, feel free to reach us at:</p>
                <div className="flex flex-col gap-2">
                  <a href="mailto:contact@rimotogear.com" className="text-[13px] text-gray-700 hover:text-accent font-medium transition-colors">contact@rimotogear.com</a>
                  <a href="tel:+917449102000" className="text-[13px] text-gray-700 hover:text-accent font-medium transition-colors">+91 74491 02000</a>
                </div>
              </div>
              <div className="mt-10">
                <Button variant="outline" size="sm" onClick={() => { setIsSubmitted(false); form.resetFields(); setClaimType(''); }}>
                  Submit Another Claim
                </Button>
              </div>
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark={false}
              className="space-y-4"
            >
              <Form.Item
                label={<span className="font-bold uppercase text-[11px] tracking-widest">Select Claim Type</span>}
                name="claimType"
                rules={[{ required: true, message: 'Please select a claim type' }]}
              >
                <Select
                  size="large"
                  placeholder="Select Claim Type"
                  onChange={setClaimType}
                  className="w-full"
                >
                  <Option value="warranty">Warranty</Option>
                  <Option value="return">Return</Option>
                  <Option value="exchange">Exchange</Option>
                </Select>
              </Form.Item>

              {claimType && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 mt-8 border-t border-gray-200 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">Customer Name</span>}
                      name="customerName"
                      rules={[{ required: true, message: 'Please enter your full name' }]}
                    >
                      <Input size="large" placeholder="Full Name" className="border-black focus:border-accent hover:border-accent rounded-none" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">Order Number</span>}
                      name="orderNumber"
                      rules={[{ required: true, message: 'Please enter your order number' }]}
                    >
                      <Input size="large" placeholder="e.g. 232" className="border-black focus:border-accent hover:border-accent rounded-none" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">Email Address</span>}
                      name="email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input size="large" placeholder="Valid email required" className="border-black focus:border-accent hover:border-accent rounded-none" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">WhatsApp Phone Number</span>}
                      name="phone"
                      rules={[
                        { required: true, message: 'Please enter your phone number' },
                        { pattern: /^[0-9]{10,15}$/, message: 'Must be 10-15 digits' }
                      ]}
                    >
                      <Input size="large" placeholder="Include country code (optional)" className="border-black focus:border-accent hover:border-accent rounded-none" />
                    </Form.Item>

                    {(claimType === 'warranty' || claimType === 'exchange') && (
                      <Form.Item
                        label={<span className="font-bold uppercase text-[11px] tracking-widest">Customer's Billing Address</span>}
                        name="billingAddress"
                        rules={[{ required: true, message: 'Please enter your billing address' }]}
                        className="md:col-span-2"
                      >
                        <TextArea rows={3} placeholder="Full billing address" className="border-black focus:border-accent hover:border-accent rounded-none" />
                      </Form.Item>
                    )}

                    {claimType === 'exchange' && (
                      <Form.Item
                        label={<span className="font-bold uppercase text-[11px] tracking-widest">Customer's Shipping Address</span>}
                        name="shippingAddress"
                        rules={[{ required: true, message: 'Please enter your shipping address (type N/A if same)' }]}
                        className="md:col-span-2"
                      >
                        <TextArea rows={3} placeholder="Can type N/A if same as billing" className="border-black focus:border-accent hover:border-accent rounded-none" />
                      </Form.Item>
                    )}

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">Purchase Date</span>}
                      name="purchaseDate"
                      rules={[{ required: true, message: 'Please select purchase date' }]}
                    >
                      <DatePicker size="large" className="w-full border-black focus:border-accent hover:border-accent rounded-none" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">{claimType === 'exchange' ? 'Returning Product Name' : 'Product Name'}</span>}
                      name={claimType === 'exchange' ? 'returningProductName' : 'productName'}
                      rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                      <Input size="large" placeholder="Product name" className="border-black focus:border-accent hover:border-accent rounded-none" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">{claimType === 'exchange' ? 'Returning Product Color' : 'Product Color'}</span>}
                      name={claimType === 'exchange' ? 'returningProductColor' : 'productColor'}
                      rules={[{ required: true, message: 'Please select color' }]}
                    >
                      <Select size="large" placeholder="Select Color" className="w-full">
                        {colors.map(c => <Option key={c} value={c}>{c}</Option>)}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">{claimType === 'exchange' ? 'Returning Product Size' : 'Product Size'}</span>}
                      name={claimType === 'exchange' ? 'returningProductSize' : 'productSize'}
                      rules={[{ required: true, message: 'Please select size' }]}
                    >
                      <Select size="large" placeholder="Select Size" className="w-full">
                        {sizes.map(s => <Option key={s} value={s}>{s}</Option>)}
                      </Select>
                    </Form.Item>

                    {claimType === 'exchange' && (
                      <>
                        <div className="md:col-span-2 mt-4 mb-2 border-b border-gray-200 pb-2">
                          <h3 className="font-display uppercase text-lg">Exchange For</h3>
                        </div>
                        <Form.Item
                          label={<span className="font-bold uppercase text-[11px] tracking-widest">Exchange Product Name</span>}
                          name="exchangeProductName"
                          rules={[{ required: true, message: 'Please enter exchange product name' }]}
                        >
                          <Input size="large" placeholder="Product name" className="border-black focus:border-accent hover:border-accent rounded-none" />
                        </Form.Item>

                        <Form.Item
                          label={<span className="font-bold uppercase text-[11px] tracking-widest">Exchange Product Color</span>}
                          name="exchangeProductColor"
                          rules={[{ required: true, message: 'Please select color' }]}
                        >
                          <Select size="large" placeholder="Select Color" className="w-full">
                            {colors.map(c => <Option key={c} value={c}>{c}</Option>)}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label={<span className="font-bold uppercase text-[11px] tracking-widest">Exchange Product Size</span>}
                          name="exchangeProductSize"
                          rules={[{ required: true, message: 'Please select size' }]}
                        >
                          <Select size="large" placeholder="Select Size" className="w-full">
                            {sizes.map(s => <Option key={s} value={s}>{s}</Option>)}
                          </Select>
                        </Form.Item>
                      </>
                    )}

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">Upload Invoice Image</span>}
                      name="invoice"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                      rules={[{ validator: (_: any, value: any) => (value && value.length > 0 ? Promise.resolve() : Promise.reject(new Error('Invoice is required'))) }]}
                      className="md:col-span-2"
                    >
                      <Upload {...uploadProps} accept=".pdf,application/pdf,image/*">
                        <Button variant="outline" type="button" size="sm">
                          <UploadOutlined className="mr-2" /> Select PDF/Image
                        </Button>
                      </Upload>
                    </Form.Item>
                    <p className="-mt-3 mb-2 text-[10px] text-gray-500 uppercase tracking-widest md:col-span-2">Max 100MB</p>

                    <Form.Item
                      label={<span className="font-bold uppercase text-[11px] tracking-widest">Upload Product Images / Videos</span>}
                      name="productMedia"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                      rules={[{ validator: (_: any, value: any) => (value && value.length > 0 ? Promise.resolve() : Promise.reject(new Error('Product media is required'))) }]}
                      className="md:col-span-2"
                    >
                      <Upload {...multiUploadProps} accept=".mp4,.mov,.avi,video/*,image/*">
                        <Button variant="outline" type="button" size="sm">
                          <UploadOutlined className="mr-2" /> Select Files (Max 10)
                        </Button>
                      </Upload>
                    </Form.Item>
                    {claimType === 'return' && (
                      <p className="-mt-3 mb-2 text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed md:col-span-2">
                        Must show full product, tags visible, labels visible, original packaging visible.
                      </p>
                    )}

                    <Form.Item
                      label={
                        <span className="font-bold uppercase text-[11px] tracking-widest">
                          {claimType === 'warranty' ? 'Describe the issue in detail' : claimType === 'return' ? 'Reason for return' : 'Describe reason for exchange in detail'}
                        </span>
                      }
                      name="reason"
                      rules={[{ required: true, message: 'Detailed description required' }]}
                      className="md:col-span-2"
                    >
                      <TextArea rows={4} placeholder="Please provide detailed information" className="border-black focus:border-accent hover:border-accent rounded-none" />
                    </Form.Item>

                    <Form.Item
                      name="terms"
                      valuePropName="checked"
                      rules={[
                        { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms')) }
                      ]}
                      className="md:col-span-2 mt-2"
                    >
                      <Checkbox>
                        <span className="text-[13px] font-medium text-gray-700 ml-1">
                          I hereby accept to all the terms and conditions mentioned in the {claimType === 'warranty' ? 'Warranty' : claimType === 'return' ? 'Return' : 'Exchange'} Claim section on www.rimotogear.com
                        </span>
                      </Checkbox>
                    </Form.Item>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <Button type="submit" variant="accent" size="lg" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Claim'}
                    </Button>
                  </div>
                </div>
              )}
            </Form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
