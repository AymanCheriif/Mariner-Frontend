import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AppButton, AppCard, Input } from '~components/atoms';
import { cargoTaxonomyQueryKey, useGetCargoCategories } from '~hooks/cargoTaxonomy';
import { cargoTaxonomyService } from '~services/cargoTaxonomy';
import { CargoCategoryOptionDTO, CargoSubCategoryOptionDTO } from '~services/cargoTaxonomy/types';
import styles from './CargoTaxonomy.module.css';

const getErrorMessage = (error: unknown, fallback: string) => {
	if (
		typeof error === 'object' &&
		error !== null &&
		'response' in error &&
		typeof (error as { response?: unknown }).response === 'object' &&
		(error as { response?: { data?: { message?: string } } }).response?.data?.message
	) {
		return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallback;
};

export const CargoTaxonomyPage = () => {
	const queryClient = useQueryClient();
	const { data: categories = [], isLoading } = useGetCargoCategories();

	const [selectedCategoryId, setSelectedCategoryId] = useState('');
	const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
	const [categoryName, setCategoryName] = useState('');
	const [subCategoryName, setSubCategoryName] = useState('');
	const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	});

	const selectedCategory = useMemo(
		() => categories.find((category) => category.id === selectedCategoryId) ?? null,
		[categories, selectedCategoryId]
	);
	const selectedSubCategory = useMemo(
		() => selectedCategory?.subCategories.find((subCategory) => subCategory.id === selectedSubCategoryId) ?? null,
		[selectedCategory, selectedSubCategoryId]
	);

	useEffect(() => {
		if (selectedCategoryId && !selectedCategory) {
			setSelectedCategoryId('');
			setSelectedSubCategoryId('');
		}
	}, [selectedCategory, selectedCategoryId]);

	useEffect(() => {
		if (selectedSubCategoryId && !selectedSubCategory) {
			setSelectedSubCategoryId('');
		}
	}, [selectedSubCategory, selectedSubCategoryId]);

	const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });
	const closeToast = () => setToast((prev) => ({ ...prev, open: false }));
	const refreshTaxonomy = async () => {
		await queryClient.invalidateQueries({ queryKey: cargoTaxonomyQueryKey() });
	};

	const createCategoryMutation = useMutation({
		mutationFn: cargoTaxonomyService.createCategory,
		onSuccess: async () => {
			setCategoryName('');
			await refreshTaxonomy();
			showToast('Category added successfully.', 'success');
		},
		onError: (error) => showToast(getErrorMessage(error, 'Failed to add category.'), 'error'),
	});

	const updateCategoryMutation = useMutation({
		mutationFn: cargoTaxonomyService.updateCategory,
		onSuccess: async () => {
			await refreshTaxonomy();
			showToast('Category updated successfully.', 'success');
		},
		onError: (error) => showToast(getErrorMessage(error, 'Failed to update category.'), 'error'),
	});

	const deleteCategoryMutation = useMutation({
		mutationFn: cargoTaxonomyService.deleteCategory,
		onSuccess: async () => {
			setSelectedCategoryId('');
			setSelectedSubCategoryId('');
			setCategoryName('');
			setSubCategoryName('');
			await refreshTaxonomy();
			showToast('Category deleted successfully.', 'success');
		},
		onError: (error) => showToast(getErrorMessage(error, 'Failed to delete category.'), 'error'),
	});

	const createSubCategoryMutation = useMutation({
		mutationFn: cargoTaxonomyService.createSubCategory,
		onSuccess: async () => {
			setSubCategoryName('');
			await refreshTaxonomy();
			showToast('Subcategory added successfully.', 'success');
		},
		onError: (error) => showToast(getErrorMessage(error, 'Failed to add subcategory.'), 'error'),
	});

	const updateSubCategoryMutation = useMutation({
		mutationFn: cargoTaxonomyService.updateSubCategory,
		onSuccess: async () => {
			await refreshTaxonomy();
			showToast('Subcategory updated successfully.', 'success');
		},
		onError: (error) => showToast(getErrorMessage(error, 'Failed to update subcategory.'), 'error'),
	});

	const deleteSubCategoryMutation = useMutation({
		mutationFn: cargoTaxonomyService.deleteSubCategory,
		onSuccess: async () => {
			setSelectedSubCategoryId('');
			setSubCategoryName('');
			await refreshTaxonomy();
			showToast('Subcategory deleted successfully.', 'success');
		},
		onError: (error) => showToast(getErrorMessage(error, 'Failed to delete subcategory.'), 'error'),
	});

	const isCategoryBusy = createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending;
	const isSubCategoryBusy = createSubCategoryMutation.isPending || updateSubCategoryMutation.isPending || deleteSubCategoryMutation.isPending;

	const handleCategorySubmit = () => {
		const normalizedName = categoryName.trim();
		if (!normalizedName) {
			showToast('Category name is required.', 'error');
			return;
		}

		if (selectedCategoryId) {
			updateCategoryMutation.mutate({ id: selectedCategoryId, name: normalizedName });
			return;
		}

		createCategoryMutation.mutate({ name: normalizedName });
	};

	const handleDeleteCategory = () => {
		if (!selectedCategory) {
			return;
		}
		if (!window.confirm(`Delete category "${selectedCategory.name}"?`)) {
			return;
		}
		deleteCategoryMutation.mutate(selectedCategory.id);
	};

	const handleSubCategorySubmit = () => {
		if (!selectedCategory) {
			showToast('Select a category first.', 'error');
			return;
		}

		const normalizedName = subCategoryName.trim();
		if (!normalizedName) {
			showToast('Subcategory name is required.', 'error');
			return;
		}

		if (selectedSubCategoryId) {
			updateSubCategoryMutation.mutate({ id: selectedSubCategoryId, name: normalizedName });
			return;
		}

		createSubCategoryMutation.mutate({ categoryId: selectedCategory.id, name: normalizedName });
	};

	const handleDeleteSubCategory = () => {
		if (!selectedSubCategory) {
			return;
		}
		if (!window.confirm(`Delete subcategory "${selectedSubCategory.name}"?`)) {
			return;
		}
		deleteSubCategoryMutation.mutate(selectedSubCategory.id);
	};

	const startCategoryEdit = (category: CargoCategoryOptionDTO) => {
		setSelectedCategoryId(category.id);
		setSelectedSubCategoryId('');
		setCategoryName(category.name);
		setSubCategoryName('');
	};

	const resetCategoryForm = () => {
		setSelectedCategoryId('');
		setSelectedSubCategoryId('');
		setCategoryName('');
		setSubCategoryName('');
	};

	const startSubCategoryEdit = (subCategory: CargoSubCategoryOptionDTO) => {
		setSelectedSubCategoryId(subCategory.id);
		setSubCategoryName(subCategory.name);
	};

	const resetSubCategoryForm = () => {
		setSelectedSubCategoryId('');
		setSubCategoryName('');
	};

	return (
		<div className={styles.wrapper}>
			<AppCard title="Manage Cargo Categories" className={styles.card}>
				<div className={styles.formRow}>
					<Input muiLabel="Category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
					<div className={styles.actions}>
						<AppButton value={selectedCategoryId ? 'Update' : 'Add'} onClick={handleCategorySubmit} loading={isCategoryBusy} />
						<AppButton value="Reset" variant="outlined" onClick={resetCategoryForm} disabled={isCategoryBusy} />
						<AppButton value="Delete" color="error" variant="outlined" onClick={handleDeleteCategory} disabled={!selectedCategoryId || isCategoryBusy} />
					</div>
				</div>

				{isLoading ? (
					<div className={styles.centeredState}>
						<CircularProgress size={24} />
					</div>
				) : categories.length === 0 ? (
					<div className={styles.emptyState}>No categories available yet.</div>
				) : (
					<div className={styles.list}>
						{categories.map((category) => (
							<button
								key={category.id}
								type="button"
								className={`${styles.listItem} ${selectedCategoryId === category.id ? styles.selected : ''}`}
								onClick={() => startCategoryEdit(category)}
							>
								<div>
									<div className={styles.itemTitle}>{category.name}</div>
									<div className={styles.itemMeta}>{category.subCategories.length} subcategories</div>
								</div>
								<span className={styles.itemHint}>Edit</span>
							</button>
						))}
					</div>
				)}
			</AppCard>

			<AppCard
				title={selectedCategory ? `Manage Subcategories — ${selectedCategory.name}` : 'Manage Subcategories'}
				className={styles.card}
			>
				<div className={styles.formRow}>
					<Input
						muiLabel="Subcategory name"
						value={subCategoryName}
						onChange={(e) => setSubCategoryName(e.target.value)}
						disabled={!selectedCategory}
					/>
					<div className={styles.actions}>
						<AppButton value={selectedSubCategoryId ? 'Update' : 'Add'} onClick={handleSubCategorySubmit} loading={isSubCategoryBusy} disabled={!selectedCategory} />
						<AppButton value="Reset" variant="outlined" onClick={resetSubCategoryForm} disabled={isSubCategoryBusy || !selectedCategory} />
						<AppButton value="Delete" color="error" variant="outlined" onClick={handleDeleteSubCategory} disabled={!selectedSubCategoryId || isSubCategoryBusy} />
					</div>
				</div>

				{!selectedCategory ? (
					<div className={styles.emptyState}>Select a category to manage its subcategories.</div>
				) : selectedCategory.subCategories.length === 0 ? (
					<div className={styles.emptyState}>No subcategories yet for this category.</div>
				) : (
					<div className={styles.list}>
						{selectedCategory.subCategories.map((subCategory) => (
							<button
								key={subCategory.id}
								type="button"
								className={`${styles.listItem} ${selectedSubCategoryId === subCategory.id ? styles.selected : ''}`}
								onClick={() => startSubCategoryEdit(subCategory)}
							>
								<div className={styles.itemTitle}>{subCategory.name}</div>
								<span className={styles.itemHint}>Edit</span>
							</button>
						))}
					</div>
				)}
			</AppCard>

			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={closeToast}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				sx={{ top: '0px !important', width: '100%', zIndex: 2000 }}
			>
				<Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ maxWidth: 560, mx: 'auto' }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</div>
	);
};
