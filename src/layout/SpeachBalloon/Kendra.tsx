// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { Box, HStack, Heading, VStack } from "@chakra-ui/layout"
import { Text, useToast } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import { IconButton } from "@chakra-ui/button";
import { Conversation } from "../../utils/interface";
import AICore from "./components/AICore";
import { AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import HighlightedTexts from "./components/HighlightedTexts";
import { FeaturedResultsItem, QueryResultItem, AdditionalResultAttribute, TextWithHighlights } from "@aws-sdk/client-kendra";
import { Relevance, submitFeedback } from "../../services/AWS";
import Human from "./Human";
import { useEffect, useState } from "react";
import { useGlobalContext } from '../../App';
import { Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from "@chakra-ui/icons";


export const KendraResultFeatured: React.FC<{
    queryId: string | undefined,
    resultItems: FeaturedResultsItem[]

}> = ({
    queryId,
    resultItems,
}) => {
        // FeaturedResultを表示する


        const {
            pinnedTexts: pinnedTexts,
            setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast()

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box borderColor="green.500">
                    <VStack align="start" w="85vw" minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                        <Tabs variant={"enclosed"} colorScheme='green'>
                            <TabList>
                                {resultItems.map((_resultItem: FeaturedResultsItem, idx: number) => (
                                    <Tab key={idx}>
                                        おすすめの文章 {idx}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels>
                                {resultItems.map((resultItem: FeaturedResultsItem, idx: number) => (
                                    <TabPanel key={idx}>
                                        <Heading size="sm">
                                            <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                                submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                            }}
                                                isExternal>
                                                <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                <ExternalLinkIcon mx='2px' />
                                            </Link>
                                        </Heading>
                                        <Box onClick={() => {
                                            setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                            toast({
                                                title: 'テキストがピン止めされました',
                                                description: "",
                                                status: 'success',
                                                duration: 1000,
                                                isClosable: true,
                                            })
                                        }}>
                                            <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                        </Box>
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    </VStack>
                </Box>
            )
        } else {
            return (<></>)
        }
    }


export const KendraResultExcerpt: React.FC<{
    queryId: string | undefined,
    resultItems: QueryResultItem[]
}> = ({ queryId, resultItems }) => {
    // 抜粋した回答を返す


    const {
        pinnedTexts: pinnedTexts,
        setPinnedTexts: setPinnedTexts,
    } = useGlobalContext();

    const toast = useToast()

    if (queryId !== undefined && resultItems.length > 0) {
        return (
            <Box borderColor="green.500">
                <VStack align="start" w="85vw" minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>
                    <Tabs variant={"enclosed"} colorScheme='green'>
                        <TabList>
                            {resultItems.map((_resultItem: QueryResultItem, idx: number) => (
                                <Tab key={idx}>
                                    抜粋された文章 {idx}
                                </Tab>
                            ))}
                        </TabList>

                        <TabPanels>
                            {resultItems.map((resultItem: QueryResultItem, idx: number) => (

                                <TabPanel key={idx}>
                                    <HStack>
                                        <VStack align={"left"}>
                                            <Heading size="sm">
                                                <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                                    submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                                }} isExternal>
                                                    <strong>
                                                        {
                                                            getNounAnswerFromExcerpt(getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText"))
                                                        }
                                                    </strong>
                                                    <ExternalLinkIcon mx='2px' />
                                                </Link>
                                            </Heading>
                                            <Box onClick={() => {
                                                setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                                toast({
                                                    title: 'テキストがピン止めされました',
                                                    description: "",
                                                    status: 'success',
                                                    duration: 1000,
                                                    isClosable: true,
                                                })
                                            }}>
                                                <HighlightedTexts textWithHighlights={getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText") ?? { Highlights: [], Text: "読み込みエラー" }} />
                                            </Box>
                                            <HStack mt="5" display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                                                <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                                    toast({
                                                        title: 'フィードバックありがとうございます',
                                                        description: "",
                                                        status: 'success',
                                                        duration: 1000,
                                                        isClosable: true,
                                                    })
                                                    submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                                }} />
                                                <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                                    toast({
                                                        title: 'フィードバックありがとうございます',
                                                        description: "",
                                                        status: 'success',
                                                        duration: 1000,
                                                        isClosable: true,
                                                    })
                                                    submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                                }} />
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Box>
        )
    } else {
        return (<></>)
    }
}


function getFAQWithHighlight(AdditionalAttributes: AdditionalResultAttribute[], targetName: string): TextWithHighlights | undefined {
    // FAQからQuestion もしくは Answerを取り出す


    for (let i = 0; i < AdditionalAttributes.length; i++) {
        if (AdditionalAttributes[i].Key === targetName) {
            return AdditionalAttributes[i].Value?.TextWithHighlightsValue
        }
    }
    return { Highlights: [], Text: "該当なし" }
}


function getNounAnswerFromExcerpt(textWithHighlights: TextWithHighlights | undefined): string {
    // AnswerText から 名詞を取り出す

    if (textWithHighlights?.Highlights?.length === 1) {
        const highlight = textWithHighlights.Highlights[0];
        const begin = highlight.BeginOffset ?? 0;
        const end = highlight.EndOffset ?? textWithHighlights.Text?.length ?? 0;

        return textWithHighlights.Text?.substring(begin, end) ?? "";
    }
    return "";
}


export const KendraResultFAQ: React.FC<{
    queryId: string | undefined,
    resultItems: QueryResultItem[]

}> = ({
    queryId,
    resultItems,
}) => {
        // FAQ を表示


        const {
            pinnedTexts: pinnedTexts,
            setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast()

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <Box borderColor="green.500">
                    <HStack minH='10vh' p='10px' bg={true ? "white" : "yellow.100"}>

                        <VStack align="start" w="85vw">
                            <Tabs variant={"enclosed"} colorScheme='green'>
                                <TabList>
                                    {resultItems.map((_resultItem: QueryResultItem, idx: number) => (
                                        <Tab key={idx}>
                                            よくある質問 {idx}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {resultItems.map((resultItem: QueryResultItem, idx: number) => (

                                        <TabPanel key={idx}>
                                            <VStack align={"left"}>
                                                <Heading size="sm">
                                                    <Link color="green.500" href={resultItem.DocumentURI} onClick={() => {
                                                        submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                                    }} isExternal>
                                                        <HighlightedTexts textWithHighlights={
                                                            getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "QuestionText") ?? { Highlights: [], Text: "読み込みエラー" }
                                                        } />
                                                        <ExternalLinkIcon mx='2px' />
                                                    </Link>
                                                </Heading>
                                                <Box onClick={() => {
                                                    setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                                    toast({
                                                        title: 'テキストがピン止めされました',
                                                        description: "",
                                                        status: 'success',
                                                        duration: 1000,
                                                        isClosable: true,
                                                    })
                                                }} >
                                                    <HighlightedTexts textWithHighlights={getFAQWithHighlight(resultItem.AdditionalAttributes ?? [], "AnswerText") ?? { Highlights: [], Text: "読み込みエラー" }} />
                                                </Box>
                                                <HStack mt="5" display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                                                    <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                                        toast({
                                                            title: 'フィードバックありがとうございます',
                                                            description: "",
                                                            status: 'success',
                                                            duration: 1000,
                                                            isClosable: true,
                                                        })
                                                        submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                                    }} />
                                                    <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                                        toast({
                                                            title: 'フィードバックありがとうございます',
                                                            description: "",
                                                            status: 'success',
                                                            duration: 1000,
                                                            isClosable: true,
                                                        })
                                                        submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                                    }} />
                                                </HStack>
                                            </VStack>
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </Tabs>
                        </VStack>
                    </HStack>
                </Box>
            )
        } else {
            return (<></>)
        }
    }


export const KendraResultDoc: React.FC<{
    queryId: string | undefined,
    resultItems: QueryResultItem[]

}> = ({
    queryId,
    resultItems,
}) => {
        // 文章のリストを表示する


        const {
            pinnedTexts: pinnedTexts,
            setPinnedTexts: setPinnedTexts,
        } = useGlobalContext();

        const toast = useToast()

        if (queryId !== undefined && resultItems.length > 0) {
            return (
                <>
                    <Box borderColor="green.500" >
                        <HStack p='30px'>
                            <Text>関連する文章</Text>
                        </HStack>
                    </Box>
                    {
                        resultItems.map((resultItem, idx: number) => (
                            <Box key={idx} borderColor="green.500">
                                <VStack minH='10vh' pl='30px' pr='30px' align="start" w="85vw" bg={true ? "white" : "yellow.100"}>
                                    <Heading size="sm">
                                        <Link color="green.500" href={resultItem.DocumentURI ?? "#"} onClick={() => {
                                            submitFeedback(Relevance['Click'], resultItem.Id ?? "", queryId)
                                        }} isExternal>
                                            <HighlightedTexts textWithHighlights={resultItem.DocumentTitle ?? { Highlights: [], Text: "読み込みエラー" }} />
                                            <ExternalLinkIcon mx='2px' />
                                        </Link>
                                    </Heading>
                                    <Box onClick={() => {
                                        setPinnedTexts([...pinnedTexts, resultItem.DocumentExcerpt?.Text ?? "読み込みエラー"])
                                        toast({
                                            title: 'テキストがピン止めされました',
                                            description: "",
                                            status: 'success',
                                            duration: 1000,
                                            isClosable: true,
                                        })
                                    }} >
                                        <HighlightedTexts textWithHighlights={resultItem.DocumentExcerpt ?? { Highlights: [], Text: "読み込みエラー" }} />
                                    </Box>
                                    <HStack mt="5" display={"flex"} justifyContent={"flex-end"} width={"100%"}>
                                        <IconButton aria-label='Search database' icon={<AiOutlineLike />} backgroundColor={"transparent"} onClick={() => {
                                            toast({
                                                title: 'フィードバックありがとうございます',
                                                description: "",
                                                status: 'success',
                                                duration: 1000,
                                                isClosable: true,
                                            })
                                            submitFeedback(Relevance['Relevant'], resultItem.Id ?? "", queryId)
                                        }} />
                                        <IconButton aria-label='Search database' icon={<AiOutlineDislike />} backgroundColor={"transparent"} onClick={() => {
                                            toast({
                                                title: 'フィードバックありがとうございます',
                                                description: "",
                                                status: 'success',
                                                duration: 1000,
                                                isClosable: true,
                                            })
                                            submitFeedback(Relevance['NotRelevant'], resultItem.Id ?? "", queryId)
                                        }} />
                                    </HStack>
                                </VStack>
                            </Box>
                        ))
                    }
                </>
            )
        } else {
            return (<>
                <Box borderColor="green.500" >
                    <HStack p='30px'>
                        <Text>関連する文章</Text>
                    </HStack>
                </Box>
                <Box borderColor="green.500" >
                    <HStack p='30px'>
                        <Text>該当なし</Text>
                    </HStack>
                </Box>
            </>)
        }
    }

    
const Kendra: React.FC<{ data: Conversation }> = ({ data }) => {
    // Kendraモード, RAGモード時の吹き出し


    const [featuredItems, setFeaturedItems] = useState<FeaturedResultsItem[]>([]);
    const [faqItems, setFaqItems] = useState<QueryResultItem[]>([]);
    const [excerptItems, setExcerptItems] = useState<QueryResultItem[]>([]);
    const [docItems, setDocItems] = useState<QueryResultItem[]>([]);

    useEffect(() => {
        const tmpFeaturedItems: FeaturedResultsItem[] = [];
        const tmpFaqItems: QueryResultItem[] = [];
        const tmpExcerptItems: QueryResultItem[] = [];
        const tmpDocItems: QueryResultItem[] = [];

        // Featured Itemのデータを分離
        if (data && data?.kendraResponse?.FeaturedResultsItems) {
            for (const result of data.kendraResponse.FeaturedResultsItems) {
                tmpFeaturedItems.push(result)
            }
        }


        // FAQ、抜粋した回答、ドキュメントを分離
        if (data && data?.kendraResponse?.ResultItems) {
            for (const result of data.kendraResponse.ResultItems) {
                switch (result.Type) {
                    case "ANSWER":
                        tmpExcerptItems.push(result);
                        break;
                    case "QUESTION_ANSWER":
                        tmpFaqItems.push(result);
                        break;
                    case "DOCUMENT":
                        tmpDocItems.push(result);
                        break;
                    default:
                        break;
                }
            }
        }

        setFeaturedItems(tmpFeaturedItems)
        setFaqItems(tmpFaqItems)
        setExcerptItems(tmpExcerptItems)
        setDocItems(tmpDocItems)

    }, [data]);

    return (
        <>
            {/* aiResult があれば出力 */}
            {data.aiResponse && <AICore data={data.aiResponse} />}
            {/* FeaturedResultを表示 */}
            <KendraResultFeatured queryId={data.kendraResponse?.QueryId} resultItems={featuredItems} />
            {/* FAQを表示 */}
            <KendraResultFAQ queryId={data.kendraResponse?.QueryId} resultItems={faqItems} />
            {/* 抜粋した回答を表示 */}
            <KendraResultExcerpt queryId={data.kendraResponse?.QueryId} resultItems={excerptItems} />
            {/* 文章のリストを表示 */}
            <KendraResultDoc queryId={data.kendraResponse?.QueryId} resultItems={docItems} />
            {/* 人の入力を表示 */}
            <Human data={data} />
        </>
    )

};
export default Kendra;