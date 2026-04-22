import { SearchRaffApplicantsResponse } from "@workspace/types/new-visa"
import { useEffect, useMemo, useState } from "react"
import { useVisaColumn } from "../context/visa-columns-context"
import { useMutation } from "@tanstack/react-query"
import { orpc } from "@workspace/orpc/lib/orpc"
import { Card } from "@workspace/ui/components/card"
import { ChevronRight, CirclePlus, CircleUser, Search, Trash2, X } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { Button } from "@workspace/ui/components/button"
import { AppImage as Image } from "../../../platform/image"
import { toast } from "sonner";

export const RaffApplicationSection = () => {
    const [open, setOpen] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [applicantList, setApplicantList] = useState<SearchRaffApplicantsResponse[]>([])

    // temporary dialog selection state
    const [selectedApplicants, setSelectedApplicants] = useState<SearchRaffApplicantsResponse[]>([])

    // committed saved passports coming from context
    const { raffApplicants, setRaffApplicants, columnNumber } = useVisaColumn()



    console.log("selectedApplicants", raffApplicants, selectedApplicants.length == 0)
    // store last committed applicants as objects for cancel functionality
    const [committedApplicants, setCommittedApplicants] = useState<SearchRaffApplicantsResponse[]>([])

    const count = useMemo(() => selectedApplicants.length, [selectedApplicants])
    const hasApplicants = count > 0

    const { mutate, data, isPending } = useMutation(orpc.visa.searchRaffApplication.mutationOptions())


    useEffect(() => {
        if (columnNumber !== 3) {
            setSelectedApplicants([])
            setCommittedApplicants([])
            setRaffApplicants([])
        }
    }, [columnNumber])

    // Search debounce
    useEffect(() => {
        if (!open || searchText.length <= 2) return
        if (!searchText) {
            setApplicantList([])
            return
        }

        const handler = setTimeout(() => {
            mutate({ search_text: searchText })
        }, 300)

        return () => clearTimeout(handler)
    }, [searchText, mutate, open])


    // Filter out already selected applicants
    useEffect(() => {
        if (!open) return

        if (data?.status === "success" && searchText) {
            const filtered = data.data.filter(i => {
                const passport = i["identity_details-passport_number"]
                return !selectedApplicants.some(s => s["identity_details-passport_number"] === passport)
            })
            setApplicantList(filtered)
        } else {
            setApplicantList([])
        }
    }, [data, selectedApplicants, open])


    // When dialog opens: restore committed applicants
    const handleOpen = () => {
        setOpen(true)
        setSearchText("")
        setApplicantList([])

        // Convert committed passport list into object form
        const mapped = committedApplicants.length > 0 ? committedApplicants : []
        setSelectedApplicants(mapped)
    }

    // When Cancel is pressed or modal closed
    const onClose = () => {
        setOpen(false)
        setSearchText("")
        setApplicantList([])

        // restore committed applicants
        setSelectedApplicants(committedApplicants)
    }


    const handleAddApplicant = (applicant: SearchRaffApplicantsResponse) => {
        const passport = applicant["identity_details-passport_number"]

        if (selectedApplicants.length >= 9) {
            toast.error(
                "Applicant Limit Exceeded."
            );
            return
        }

        if (!selectedApplicants.some(a => a["identity_details-passport_number"] === passport)) {
            setSelectedApplicants(prev => [...prev, applicant])
        }

        setSearchText("")
        setApplicantList([])
    }

    const deleteApplicant = (ele: SearchRaffApplicantsResponse) => {
        setSelectedApplicants(prev =>
            prev.filter(
                x => x["identity_details-passport_number"] !== ele["identity_details-passport_number"]
            )
        )
    }

    // OK saves the values permanently
    const handleOk = () => {
        const passports = selectedApplicants.map(i => i["identity_details-passport_number"])

        // Save only the passport list in context
        setRaffApplicants(passports)

        // Save full applicant objects locally for reopening/cancel
        setCommittedApplicants(selectedApplicants)

        setOpen(false)
    }


    const handleSearchText = () => {
        console.log("searchText", searchText?.length)
        if (searchText?.length > 2) {
            mutate({ search_text: searchText })
        }
    }


    return (
        <div>
            <Card className="border p-3 cursor-pointer" onClick={handleOpen}>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-black font-semibold text-sm">
                            Repeat Visa Application
                        </span>
                        <span className="text-sm">For repeat applicants</span>

                        {hasApplicants && (
                            <span className="text-blue-400 text-sm">
                                {count} {count > 1 ? "Applicant/s" : "Applicant"} Added
                            </span>
                        )}
                    </div>

                    <ChevronRight />
                </div>
            </Card>

            <Dialog open={open} onOpenChange={onClose}  >
                <DialogContent className="min-w-full rounded-none md:rounded-md md:min-w-[80vw] p-0 flex flex-col overflow-hidden max-h-full md:max-h-[90vh]">
                    <DialogHeader className="p-3 md:px-4 md:pb-0">
                        <DialogTitle>Repeat Visa Application</DialogTitle>
                    </DialogHeader>

                    <div className="p-3 md:px-4 gap-5 md:gap-2 flex-1 grid md:grid-cols-2 overflow-auto md:overflow-auto ">
                        {/* LEFT SIDE */}
                        <div className="flex flex-col gap-5">
                            <div className="text-sm">
                                Save time by auto filling the documents if applying again
                                for the same applicant.
                            </div>

                            <Card className="flex flex-col gap-2 p-3 py-4">
                                <Label className="pl-1">
                                    Re-apply with Name, Passport Number or Ref Id
                                </Label>

                                <div className="relative">
                                    <Input
                                        placeholder="Search by Name, Passport No. or Ref Id"
                                        endIcon={searchText?.length > 0 ? <X size={18} onClick={() => setSearchText("")} className="text-gray-400 cursor-pointer" /> : <Search size={18} onClick={handleSearchText} className="text-gray-400 cursor-pointer" />}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        value={searchText}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearchText()}
                                    />

                                    {(isPending || searchText.length > 2) && (
                                        <div className="absolute top-10 w-full bg-white border rounded-md shadow-lg z-20 max-h-[200px] overflow-auto">
                                            {isPending && (
                                                <div className="p-3 text-sm text-gray-600">Searching...</div>
                                            )}

                                            {!isPending &&
                                                searchText?.length >= 2 &&
                                                applicantList.length === 0 && (
                                                    <div className="p-3 text-sm text-gray-600">
                                                        No Applicants Found.
                                                    </div>
                                                )}

                                            {!isPending &&
                                                applicantList.map((item, idx) => {
                                                    const passport = item["identity_details-passport_number"]
                                                    const name =
                                                        item["personal_details-first_name"] +
                                                        " " +
                                                        item["personal_details-last_name"]

                                                    const profile = item["applicant_profile_url"]

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer w-full overflow-hidden"
                                                            onClick={() => handleAddApplicant(item)}
                                                        >
                                                            {profile ? (
                                                                <div className="w-[32px] h-[32px] rounded-full overflow-hidden relative">
                                                                    <Image alt="profile" src={profile} fill className="object-cover" />
                                                                </div>
                                                            ) : (
                                                                <CircleUser size={32} />
                                                            )}

                                                            <div className="flex flex-col text-sm flex-1">
                                                                <span className="font-medium">{name}</span>
                                                                <span className="text-gray-600 text-xs">{passport}</span>
                                                            </div>

                                                            <CirclePlus fill="black" className="text-white" />
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* SELECTED APPLICANTS */}
                            {selectedApplicants.length > 0 && (
                                <div className="grid md:grid-cols-2 gap-5 ">
                                    {selectedApplicants.map((item, idx) => {
                                        const passport = item["identity_details-passport_number"]
                                        const name =
                                            item["personal_details-first_name"] +
                                            " " +
                                            item["personal_details-last_name"]

                                        const profile = item["applicant_profile_url"]

                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 w-full border bg-gray-100 rounded-md"
                                            >
                                                {profile ? (
                                                    <div className="w-[32px] h-[32px] overflow-hidden rounded-full relative shrink-0">
                                                        <Image alt="profile" src={profile} fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <CircleUser size={32} />
                                                )}

                                                <div className="flex flex-col text-sm flex-1  min-w-0">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="truncate font-sm">{name}</span>
                                                            </TooltipTrigger>

                                                            <TooltipContent className="bg-white">
                                                                <span className="text-gray-500">{name}</span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-gray-600 text-xs truncate font-sm">{passport}</span>
                                                            </TooltipTrigger>

                                                            <TooltipContent className="bg-white">
                                                                <span className="text-gray-600">{passport}</span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>


                                                </div>

                                                <Trash2
                                                    size={"18px"}
                                                    className="text-red-600 cursor-pointer shrink-0"
                                                    onClick={() => deleteApplicant(item)}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDE INFO */}
                        <div className="bg-gray-100 rounded-md p-5 flex flex-col gap-4 text-sm">
                            <section>
                                <span className="font-semibold">How Repeat Application Process Works?
                                </span>
                                <p>
                                    You can reapply for any applicant who had applied for a visa previously in the system. The system will auto-fill available form details and documents for the applicant
                                </p>
                            </section>

                            <section>
                                <span className="font-semibold">
                                    How to Search for an Applicant?

                                </span>
                                <p>
                                    You can search for applicants using the passport number or previous application reference ID or the applicant's first and last name. You can only search for applicants for the nationality that you have selected.

                                </p>
                            </section>

                            <section>
                                <span className="font-semibold">
                                    How Form Data and Documents Are Auto-populated?

                                </span>
                                <p>
                                    Available documents and form data are automatically populated if available. 'One-time use' documents like airline tickets will not be auto-populated. For example, if an applicant had visited the United Arab Emirates and is currently applying for Kenya, the system will auto-populate documents and data which is available and applicable for Kenya.

                                </p>
                            </section>

                            <section>
                                <span className="font-semibold">
                                    Why Can't I Find an Applicant I Had Previously Applied For?
                                </span>
                                <p>
                                    To safeguard applicant data and documents, the system has a purging policy. The purging policy will delete applicant form data and documents if its retention period expires. The purging policy is configured by the system administrator.
                                </p>
                            </section>
                        </div>
                    </div>

                    <DialogFooter className="border-t p-3 md:px-4 flex flex-row justify-end gap-4 " >
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>

                        <Button onClick={handleOk} disabled={selectedApplicants.length === 0}>Proceed</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
